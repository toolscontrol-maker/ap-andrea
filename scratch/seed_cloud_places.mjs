import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const mapConstantsFile = fs.readFileSync(
  path.join(process.cwd(), 'apps', 'mobile', 'src', 'components', 'map', 'map.constants.ts'),
  'utf8'
);

const jsonMatch = mapConstantsFile.match(/export const DEMO_MAP_PLACES: AndreaMapPlace\[\] = (\[[\s\S]*?\]);/);
if (!jsonMatch) {
  console.error('No se pudo extraer DEMO_MAP_PLACES');
  process.exit(1);
}

const places = JSON.parse(jsonMatch[1]);

async function seedCloudPlaces() {
  console.log(`🚀 Sembrando ${places.length} ubicaciones oficiales en Supabase Cloud...`);

  // 1. Ensure couple exists
  const { error: cErr } = await client.from('couples').upsert({
    id: 'andrea-tonet',
    name: 'Andrea & Tonet',
    start_date: '2025-02-15',
    city: 'Valencia',
    country: 'España',
  });
  if (cErr) console.warn('Couple upsert notice:', cErr);

  // 2. Insert/Upsert places into map_places
  const payload = places.map((p) => ({
    id: p.id,
    couple_id: 'andrea-tonet',
    author_id: '11111111-aaaa-bbbb-cccc-111111111111',
    title: p.title,
    subtitle: p.subtitle,
    city_name: p.city || 'Valencia',
    country: 'España',
    country_code: 'ES',
    lat: p.latitude,
    lng: p.longitude,
    date: p.date || '2025-02-15',
    story: p.description,
    category: p.type,
    mood_tag: 'love',
    photos: p.imageUrl ? [p.imageUrl] : [],
    location_precision: p.precision || 'exact',
    visibility: 'couple',
    is_milestone: p.id.startsWith('milestone'),
  }));

  const { data, error } = await client.from('map_places').upsert(payload);
  if (error) {
    console.error('❌ Error sembrando en Supabase:', error);
  } else {
    console.log(`✅ ¡${payload.length} rincones de vuestra historia sincronizados con éxito en Supabase Cloud!`);
  }
}

seedCloudPlaces().catch(console.error);
