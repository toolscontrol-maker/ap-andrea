import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vryzszsfdvhkyquuclcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeXpzenNmZHZoa3lxdXVjbGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA0MjcsImV4cCI6MjA1NTkyNjQyN30.i-W-rEee3V3YQhK2B9aZ6Uq51k9M9_R0S7A7rS5zX6E';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
  console.log('🔍 Comprobando tablas en Supabase Cloud...');

  const tables = ['couples', 'profiles', 'wishes', 'saved_places', 'map_places', 'couple_events'];
  const results = {};

  for (const t of tables) {
    try {
      const { data, error } = await client.from(t).select('id').limit(1);
      if (error) {
        results[t] = `Error: ${error.message} (${error.code})`;
      } else {
        results[t] = `OK (${data ? data.length : 0} filas encontradas)`;
      }
    } catch (e) {
      results[t] = `Exception: ${e.message}`;
    }
  }

  console.log('Resultados de Supabase:', JSON.stringify(results, null, 2));
}

testSupabase();
