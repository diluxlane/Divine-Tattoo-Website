const CLIENT_ID = '30ec6ac5-2756-4a5f-88ae-ab6ddb7a3c85';
const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'GET, OPTIONS','Content-Type':'application/json','Cache-Control':'public, max-age=60, s-maxage=60'};
Deno.serve(async req => {
  if (req.method==='OPTIONS') return new Response('ok',{headers});
  if (req.method!=='GET') return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers});
  try {
    const url=Deno.env.get('SUPABASE_URL');
    const key=Deno.env.get('SUPABASE_ANON_KEY');
    if (!url||!key) throw new Error('Missing public configuration');
    const response=await fetch(url+'/rest/v1/portfolio_items?client_id=eq.'+CLIENT_ID+'&published=eq.true&select=id,image_url,created_at,display_order&order=display_order.asc,created_at.asc,id.asc',{headers:{apikey:key,Authorization:'Bearer '+key}});
    if (!response.ok) throw new Error('Gallery unavailable');
    return new Response(JSON.stringify({items:await response.json()}),{headers});
  } catch { return new Response(JSON.stringify({error:'Unable to load portfolio'}),{status:503,headers:{...headers,'Cache-Control':'no-store'}}); }
});

