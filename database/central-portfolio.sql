-- Applied to Zyberlane - Platform, not the legacy Divine Tattoo project.
-- Additive setup: preserve existing records, policies and business tables.

CREATE OR REPLACE FUNCTION public.assign_client_portfolio_display_order()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(NEW.client_id::text, 0));
  IF NEW.display_order IS NULL OR NEW.display_order <= 0 THEN
    SELECT coalesce(max(p.display_order), 0) + 1 INTO NEW.display_order
    FROM public.portfolio_items p WHERE p.client_id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_client_portfolio_display_order() FROM PUBLIC;

CREATE TRIGGER trg_assign_client_portfolio_display_order
BEFORE INSERT ON public.portfolio_items
FOR EACH ROW EXECUTE FUNCTION public.assign_client_portfolio_display_order();

CREATE OR REPLACE FUNCTION public.move_client_portfolio_item_to_position(
  p_client_id uuid, p_item_id uuid, p_target_position integer
)
RETURNS TABLE(idid uuid, display_order integer)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_ids uuid[];
  v_count integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_client_member(p_client_id) THEN
    RAISE EXCEPTION 'Not authorized for this client' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_client_id::text, 0));
  SELECT array_agg(p.id ORDER BY p.display_order, p.created_at, p.id) INTO v_ids
  FROM public.portfolio_items p WHERE p.client_id = p_client_id;
  v_count := coalesce(cardinality(v_ids), 0);
  IF p_target_position IS NULL OR p_target_position < 1 OR p_target_position > v_count THEN
    RAISE EXCEPTION 'Position must be between 1 and %', v_count;
  END IF;
  IF p_item_id IS NULL OR NOT (p_item_id = ANY(v_ids)) THEN
    RAISE EXCEPTION 'Portfolio item not found';
  END IF;
  v_ids := array_remove(v_ids, p_item_id);
  v_ids := coalesce(v_ids[1:p_target_position-1], '{}'::uuid[])
           || ARRAY[p_item_id]
           || coalesce(v_ids[p_target_position:cardinality(v_ids)], '{}'::uuid[]);
  UPDATE public.portfolio_items p SET display_order = r.position::integer
  FROM unnest(v_ids) WITH ORDINALITY AS r(id, position)
  WHERE p.id = r.id AND p.client_id = p_client_id;
  RETURN QUERY SELECT p.id, p.display_order FROM public.portfolio_items p
  WHERE p.client_id = p_client_id ORDER BY p.display_order, p.created_at, p.id;
END;
$$;
REVOKE ALL ON FUNCTION public.move_client_portfolio_item_to_position(uuid,uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.move_client_portfolio_item_to_position(uuid,uuid,integer) TO authenticated;
