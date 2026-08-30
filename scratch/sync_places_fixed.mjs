import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const placesToSync = [
  {
    id: 'milestone-nos-conocimos',
    couple_id: 'andrea-tonet',
    title: 'Donde nos conocimos',
    subtitle: 'Ent. Rico, 6, Quatre Carreres, 46013 Valencia, Spain',
    story: 'La noche mágica del 23 de noviembre de 2024 donde cruzamos miradas y nos conocimos por primera vez. Esa noche empezó nuestra historia.',
    category: 'memory',
    lat: 39.450132,
    lng: -0.353479,
    location_precision: 'exact',
    city_name: 'Valencia',
    date: '2024-11-23',
    photos: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'milestone-primera-cita',
    couple_id: 'andrea-tonet',
    title: 'Nuestra Primera Cita · Alqueria del Pou',
    subtitle: 'Ent. Rico, 6, Quatre Carreres, 46013 Valencia, Spain',
    story: 'Nuestra primera cita oficial en el restaurante Alqueria del Pou. Risas, confidencias y donde supimos que queríamos estar juntos.',
    category: 'date',
    lat: 39.450084,
    lng: -0.353529,
    location_precision: 'exact',
    city_name: 'Valencia',
    date: '2024-12-05',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'memory-etapa-canet',
    couple_id: 'andrea-tonet',
    title: "Nuestra etapa en Canet d'en Berenguer",
    subtitle: "Platja de Canet d'en Berenguer, 46529 Canet d'en Berenguer, Valencia, Spain",
    story: 'Desde el 5 de enero de 2025 hasta noviembre de 2025: meses maravillosos viviendo juntos frente al mar, atardeceres dorados y paseos infinitos por la playa.',
    category: 'stage',
    lat: 39.685539,
    lng: -0.206677,
    location_precision: 'exact',
    city_name: "Canet d'en Berenguer",
    date: '2025-01-05',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'place-casa-tonet',
    couple_id: 'andrea-tonet',
    title: 'Nuestra etapa en Carrer Comte del Real',
    subtitle: 'Carrer Comte Del Real, 16, 46194 Real, Valencia, Spain',
    story: 'Calle Conde de Real, 16. Nuestro hogar y refugio de amor compartido donde viví y construimos innumerables momentos juntos.',
    category: 'stage',
    lat: 39.335177,
    lng: -0.611326,
    location_precision: 'exact',
    city_name: 'Real',
    date: '2025-03-01',
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'memory-tercer-mejor-airbnb',
    couple_id: 'andrea-tonet',
    title: 'Nuestro Tercer y Mejor Airbnb Romántico',
    subtitle: 'Pg. de l\'Albereda, València, Valencia, Spain',
    story: 'Del 13 al 16 de febrero de 2025. El mejor fin de semana de nuestras vidas: San Valentín, complicidad absoluta y nuestro compromiso oficial de empezar a salir juntos.',
    category: 'memory',
    lat: 39.464377,
    lng: -0.358492,
    location_precision: 'exact',
    city_name: 'València',
    date: '2025-02-13',
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'milestone-primer-beso-pareja',
    couple_id: 'andrea-tonet',
    title: 'Primer Beso & Donde Empezamos a Salir',
    subtitle: "Pg. de l'Albereda, 44, Camins al Grau, 46023 València, Valencia, Spain",
    story: "El 15 de febrero de 2025 en el Paseo de la Alameda, 44. El rincón mágico de nuestro primer beso y donde Tonet le pidió salir a Andrea. El comienzo oficial de nuestro camino juntos.",
    category: 'memory',
    lat: 39.458650,
    lng: -0.350807,
    location_precision: 'exact',
    city_name: 'València',
    date: '2025-02-15',
    photos: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop'
    ],
  },
];

async function syncRichPlaces() {
  console.log('🔄 Sincronizando lugares enriquecidos en Supabase map_places...');
  const { data, error } = await client.from('map_places').upsert(placesToSync);
  if (error) {
    console.error('❌ Error al sincronizar en Supabase:', error);
  } else {
    console.log('✅ ¡Lugares enriquecidos guardados en Supabase Cloud con éxito!');
  }
}

syncRichPlaces().catch(console.error);
