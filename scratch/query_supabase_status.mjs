import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnNrc3JkcW1yc2pzcXh5eHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzc1OTksImV4cCI6MjA1NTc1MzU5OX0.J8e-678a1O5rN01mJ7H6KkG9uS3xYq4vZ3tQ7jP2bM8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log('--- PROFILES ---');
  const { data: profiles, error: errProf } = await supabase.from('profiles').select('*');
  console.log('Profiles err:', errProf, 'Count:', profiles?.length);
  console.log(profiles);

  console.log('\n--- MAP PLACES ---');
  const { data: mapPlaces, error: errMap } = await supabase.from('map_places').select('id, title, category, mood_tag, updated_at');
  console.log('MapPlaces err:', errMap, 'Count:', mapPlaces?.length);
  if (mapPlaces && mapPlaces.length > 0) {
    console.log('Sample place 0:', mapPlaces[0]);
    console.log('Sample place last:', mapPlaces[mapPlaces.length - 1]);
  }

  console.log('\n--- COUPLE EVENTS ---');
  const { data: events, error: errEvents } = await supabase.from('couple_events').select('id, date, status, updated_at');
  console.log('Events count:', events?.length);
}

run();
