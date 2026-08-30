import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function encodePlaceMetadata(place) {
  const meta = {
    startDate: place.startDate,
    endDate: place.endDate,
    isOngoing: place.isOngoing,
    stageSummary: place.stageSummary,
    hasDateRange: place.hasDateRange,
    dateRangeEnd: place.dateRangeEnd,
    emotionTag: place.emotionTag,
    invitedBy: place.invitedBy,
    destination1: place.destination1,
    destination2: place.destination2,
    accommodation: place.accommodation,
    tripDurationDays: place.tripDurationDays,
    visitedPlaces: place.visitedPlaces,
  };
  return JSON.stringify(meta);
}

function decodePlaceMetadata(moodTag) {
  if (!moodTag) return {};
  try {
    if (moodTag.startsWith('{')) {
      return JSON.parse(moodTag);
    }
  } catch {}
  return { emotionTag: moodTag };
}

async function testSyncAndHydration() {
  const samplePlace = {
    id: 'memory-etapa-canet',
    type: 'stage',
    title: "Nuestra etapa en Canet d'en Berenguer",
    subtitle: "Platja de Canet d'en Berenguer, 46529 Canet d'en Berenguer, Valencia, Spain",
    description: 'Meses maravillosos viviendo juntos frente al mar.',
    latitude: 39.685539,
    longitude: -0.206677,
    precision: 'exact',
    date: '2025-01-05',
    startDate: '2025-01-05',
    endDate: '2025-11-01',
    isOngoing: false,
    stageSummary: 'Convivencia y vida junto al mar mediterráneo',
    city: "Canet d'en Berenguer",
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop'
    ],
  };

  const payload = {
    id: samplePlace.id,
    couple_id: 'andrea-tonet',
    title: samplePlace.title,
    subtitle: samplePlace.subtitle,
    story: samplePlace.description,
    category: samplePlace.type,
    lat: samplePlace.latitude,
    lng: samplePlace.longitude,
    location_precision: samplePlace.precision,
    city_name: samplePlace.city,
    date: samplePlace.date,
    photos: samplePlace.photos,
    mood_tag: encodePlaceMetadata(samplePlace),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('map_places').upsert(payload);
  if (error) {
    console.error('Error upserting:', error);
    return;
  }

  // Fetch back
  const { data: fetched } = await client.from('map_places').select('*').eq('id', samplePlace.id);
  const row = fetched[0];
  const decoded = decodePlaceMetadata(row.mood_tag);
  console.log('Successfully saved and retrieved rich metadata:', {
    category: row.category,
    startDate: decoded.startDate,
    endDate: decoded.endDate,
    stageSummary: decoded.stageSummary,
  });
}

testSyncAndHydration().catch(console.error);
