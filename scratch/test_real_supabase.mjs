import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vryzszsfdvhkyquuclcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeXpzenNmZHZoa3lxdXVjbGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA0MjcsImV4cCI6MjA1NTkyNjQyN30.i-W-rEee3V3YQhK2B9aZ6Uq51k9M9_R0S7A7rS5zX6E';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('Testing connection to REAL Supabase project...');
  const { data: profiles, error: errProf } = await client.from('profiles').select('*');
  console.log('Profiles:', profiles, 'Error:', errProf);

  const { data: mapPlaces, error: errMap } = await client.from('map_places').select('id, title, category, lat, lng, mood_tag');
  console.log('Map places count:', mapPlaces?.length, 'Error:', errMap);
  if (mapPlaces && mapPlaces.length > 0) {
    console.log('First 2 places:', mapPlaces.slice(0, 2));
  }
}

test();
