import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRows() {
  const { data, error } = await client.from('map_places').select('*');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  console.log(`Total map_places in Supabase: ${data.length}`);
  data.forEach((row, i) => {
    console.log(`[${i+1}] ID: ${row.id} | Title: "${row.title}" | Category: ${row.category} | Lat: ${row.lat}, Lng: ${row.lng} | Updated: ${row.updated_at}`);
  });
}

checkRows().catch(console.error);
