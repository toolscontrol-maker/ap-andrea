import { createClient } from '@supabase/supabase-js';

const client = createClient(
  'https://qxnsksrdqmrsjsqxyxtq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bnNrc3JkcW1yc2pzcXh5eHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTI3NTcsImV4cCI6MjEwMzY2ODc1N30.8m5344vd4KAJixsz0H3xrY3iFdpou8AJRswtLXacdh8'
);

async function testMapPlaceSyncDirect() {
  console.log('--- TESTING MAP PLACE PHOTO SYNC DIRECTLY ---');

  // Test place with a photo array
  const testPlaceId = 'place-test-photo-sync';
  const testPhoto = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

  const { data, error } = await client.from('map_places').upsert({
    id: testPlaceId,
    couple_id: 'andrea-tonet',
    author_id: '11111111-aaaa-bbbb-cccc-111111111111',
    title: 'Test Rincón con Fotos',
    subtitle: 'Plaza de la Virgen, Valencia',
    city_name: 'Valencia',
    country: 'España',
    country_code: 'ES',
    lat: 39.4759,
    lng: -0.3755,
    date: '2026-08-31',
    story: 'Probando persistencia de fotos en el mapa',
    category: 'memory',
    mood_tag: '{"emotionTag":"Amor"}',
    photos: [testPhoto],
    location_precision: 'exact',
    visibility: 'couple',
    is_milestone: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' }).select();

  console.log('Upsert result:', data, 'Error:', error);

  // Query back
  const { data: queried } = await client.from('map_places').select('id, title, photos').eq('id', testPlaceId);
  console.log('Queried back from Supabase:', queried);
}

testMapPlaceSyncDirect().catch(console.error);
