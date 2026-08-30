import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectSchema() {
  const tables = ['profiles', 'couples', 'wishes', 'saved_places', 'map_places', 'couple_events', 'ritual_seeds', 'diary_entries'];
  
  for (const t of tables) {
    const { data, error } = await client.from(t).select('*').limit(1);
    console.log(`\n=== Table: ${t} ===`);
    if (error) {
      console.log(`❌ Does not exist or error:`, error.message);
    } else {
      console.log(`✅ Table exists. Sample row columns:`, data?.[0] ? Object.keys(data[0]) : 'Empty table');
    }
  }
}

inspectSchema();
