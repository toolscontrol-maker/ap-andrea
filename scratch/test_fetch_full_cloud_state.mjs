import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const COUPLE_ID = 'andrea-tonet';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFetchFullCloudState() {
  console.log('Testing fetchFullCloudState from Supabase...');
  const [
    { data: profilesData, error: profErr },
    { data: wishesData, error: wishErr },
    { data: placesData, error: placeErr },
    { data: mapPlacesData, error: mapErr },
    { data: eventsData, error: evErr },
  ] = await Promise.all([
    client.from('profiles').select('*').eq('couple_id', COUPLE_ID),
    client.from('wishes').select('*').eq('couple_id', COUPLE_ID),
    client.from('saved_places').select('*').eq('couple_id', COUPLE_ID),
    client.from('map_places').select('*').eq('couple_id', COUPLE_ID),
    client.from('couple_events').select('*').eq('couple_id', COUPLE_ID),
  ]);

  console.log('Profiles data:', profilesData, 'Error:', profErr);
  console.log('Wishes count:', wishesData?.length, 'Error:', wishErr);
  console.log('Saved places count:', placesData?.length, 'Error:', placeErr);
  console.log('Map places count:', mapPlacesData?.length, 'Error:', mapErr);
  console.log('Couple events count:', eventsData?.length, 'Error:', evErr);
}

testFetchFullCloudState();
