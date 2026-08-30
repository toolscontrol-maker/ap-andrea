import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const COUPLE_ID = 'andrea-tonet';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectAllTables() {
  console.log('--- INSPECTING SUPABASE TABLES ---');

  const tables = ['profiles', 'wishes', 'saved_places', 'map_places', 'couple_events'];
  for (const table of tables) {
    const { data, error, count } = await client.from(table).select('*', { count: 'exact' });
    console.log(`\nTable [${table}]:`);
    if (error) {
      console.error(`  ❌ Error:`, error.message, error.details, error.hint);
    } else {
      console.log(`  ✅ Count: ${data?.length}`);
      if (data && data.length > 0) {
        console.log(`  Sample row:`, Object.keys(data[0]));
      }
    }
  }
}

inspectAllTables();
