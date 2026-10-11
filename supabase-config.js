import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.3';

// Public browser configuration. Authorization is enforced by Supabase RLS.
export const SUPABASE_URL = 'https://dgolqzznwsjjuuuoygug.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_eQwwDtIpggkDNdkjIlA8Lw_NZlkGs6V';
export const CLIENT_ID = '30ec6ac5-2756-4a5f-88ae-ab6ddb7a3c85';
export const PORTFOLIO_BUCKET = 'client-portfolio';
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function canManagePortfolio() {
  const { data, error } = await supabase.rpc('is_client_member', {
    target_client_id: CLIENT_ID
  });
  return !error && data === true;
}

// Never delete an arbitrary URL or another tenant's storage object.
export function portfolioPath(imageUrl) {
  const url = new URL(imageUrl);
  const prefix = '/storage/v1/object/public/' + PORTFOLIO_BUCKET + '/';
  if (url.origin !== SUPABASE_URL || !url.pathname.startsWith(prefix)) {
    throw new Error('This image has not been migrated to central storage.');
  }
  const path = decodeURIComponent(url.pathname.slice(prefix.length));
  if (!path.startsWith(CLIENT_ID + '/') || path.split('/').some(p => p === '..' || p === '.')) {
    throw new Error('Invalid client image path.');
  }
  return path;
}
