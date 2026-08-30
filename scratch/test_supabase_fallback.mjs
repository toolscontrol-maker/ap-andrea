import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
  console.log('🔍 Probando conexión a Supabase...');
  const tables = ['couples', 'profiles', 'wishes', 'saved_places', 'map_places', 'couple_events'];
  const results = {};

  for (const t of tables) {
    try {
      const { data, error } = await client.from(t).select('id').limit(1);
      if (error) {
        results[t] = `Error: ${error.message} (${error.code})`;
      } else {
        results[t] = `OK (${data ? data.length : 0} filas)`;
      }
    } catch (e) {
      results[t] = `Exception: ${e.message}`;
    }
  }

  console.log('Resultados:', JSON.stringify(results, null, 2));
}

testSupabase();
