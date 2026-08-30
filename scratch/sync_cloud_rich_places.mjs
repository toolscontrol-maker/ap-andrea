import { createClient } from '@supabase/supabase-js';
import { DEMO_MAP_PLACES } from '../apps/mobile/src/components/map/map.constants.js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncRichPlaces() {
  console.log('🔄 Sincronizando lugares enriquecidos en Supabase map_places...');

  const dbRows = DEMO_MAP_PLACES.map((p) => ({
    id: p.id,
    couple_id: 'andrea-tonet',
    title: p.title,
    subtitle: p.subtitle || p.formattedAddress || p.city,
    story: p.description,
    category: p.type,
    lat: p.latitude,
    lng: p.longitude,
    location_precision: p.precision,
    city_name: p.city,
    date: p.date,
    photos: p.photos || (p.imageUrl ? [p.imageUrl] : []),
  }));

  const { data, error } = await client.from('map_places').upsert(dbRows);
  if (error) {
    console.error('❌ Error al sincronizar en Supabase:', error);
  } else {
    console.log('✅ ¡18 lugares enriquecidos (Etapas, Recuerdos, Citas, Restaurantes) guardados en Supabase Cloud!');
  }
}

syncRichPlaces().catch(console.error);
