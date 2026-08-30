import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectProfilesAndSync() {
  console.log('--- 1. Check profiles in Supabase ---');
  const { data: profiles, error: pErr } = await client.from('profiles').select('*');
  if (pErr) {
    console.error('❌ Error fetching profiles:', pErr);
  } else {
    console.log('✅ Profiles in Supabase count:', profiles?.length);
    console.log('Profiles data:', profiles);
  }

  console.log('\n--- 2. Check map_places in Supabase ---');
  const { data: mapPlaces, error: mErr } = await client.from('map_places').select('*');
  if (mErr) {
    console.error('❌ Error fetching map_places:', mErr);
  } else {
    console.log('✅ Map places in Supabase count:', mapPlaces?.length);
  }
}

inspectProfilesAndSync().catch(console.error);
