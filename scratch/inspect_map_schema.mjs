import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectSchema() {
  console.log('Inspecting map_places table in Supabase...');
  const { data, error } = await client.from('map_places').select('*').limit(1);
  if (error) {
    console.error('Error fetching map_places:', error);
  } else {
    console.log('Sample row from map_places:', data?.[0]);
  }
}

inspectSchema().catch(console.error);
