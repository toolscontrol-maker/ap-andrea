import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const COUPLE_ID = 'andrea-tonet';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAndPrepare() {
  console.log('--- CHECKING TABLES IN SUPABASE ---');

  // Test ritual_seeds table
  const { data: rData, error: rErr } = await client.from('ritual_seeds').select('*').limit(1);
  console.log('ritual_seeds exists?:', !rErr, rErr?.message);

  // Test feeling_pulses table
  const { data: fData, error: fErr } = await client.from('feeling_pulses').select('*').limit(1);
  console.log('feeling_pulses exists?:', !fErr, fErr?.message);

  // Check map_places columns by trying to insert a sample test row with rich fields
  const testMapPlace = {
    id: 'test-schema-check-' + Date.now(),
    couple_id: COUPLE_ID,
    author_id: '11111111-aaaa-bbbb-cccc-111111111111',
    title: 'Test Schema Place',
    subtitle: 'Valencia',
    city_name: 'Valencia',
    country: 'España',
    country_code: 'ES',
    lat: 39.4699,
    lng: -0.3763,
    date: '2025-01-01',
    story: 'Test story',
    category: 'stage',
    mood_tag: JSON.stringify({
      startDate: '2022-01-01',
      endDate: '2024-01-01',
      isOngoing: false,
      stageSummary: 'Viviendo juntos en Canet',
      emotionTag: 'Ilusión',
      photos: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop'],
    }),
    photos: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop'],
    location_precision: 'exact',
    visibility: 'couple',
    is_milestone: true,
    updated_at: new Date().toISOString(),
  };

  const { data: mapData, error: mapErr } = await client.from('map_places').upsert(testMapPlace).select();
  console.log('map_places insert result:', mapData ? 'SUCCESS' : 'ERROR', mapErr?.message);

  // Clean up test place
  await client.from('map_places').delete().eq('id', testMapPlace.id);
}

checkAndPrepare();
