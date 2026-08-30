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

const DEMO_PLACES = [
  {
    id: 'milestone-nos-conocimos',
    type: 'memory',
    title: 'Donde nos conocimos',
    subtitle: 'Ent. Rico, 6, Quatre Carreres, 46013 Valencia, Spain',
    description: 'La noche mágica del 23 de noviembre de 2024 donde cruzamos miradas y nos conocimos por primera vez. Esa noche empezó nuestra historia.',
    latitude: 39.450132,
    longitude: -0.353479,
    precision: 'exact',
    date: '2024-11-23',
    city: 'Valencia',
    photos: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Magia & Destino',
  },
  {
    id: 'milestone-primera-cita',
    type: 'date',
    title: 'Nuestra Primera Cita · Alqueria del Pou',
    subtitle: 'Ent. Rico, 6, Quatre Carreres, 46013 Valencia, Spain',
    description: 'Nuestra primera cita oficial en el restaurante Alqueria del Pou. Risas, confidencias y donde supimos que queríamos estar juntos.',
    latitude: 39.450084,
    longitude: -0.353529,
    precision: 'exact',
    date: '2024-12-05',
    city: 'Valencia',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
    invitedBy: 'tonet',
    destination1: 'Restaurante Alqueria del Pou',
    destination2: 'Paseo nocturno por la huerta de Valencia',
  },
  {
    id: 'memory-pasta-passione',
    type: 'restaurant',
    title: 'Primera vez en un italiano · Pasta e Passione',
    subtitle: 'C/ dels Juristes, 5, Ciutat Vella, 46001 València, Valencia, Spain',
    description: 'El 13 de diciembre de 2024. La primera vez que fuimos juntos a un restaurante italiano en Valencia. Pasta deliciosa y risas infinitas.',
    latitude: 39.475574,
    longitude: -0.376467,
    precision: 'exact',
    date: '2024-12-13',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'memory-tercera-cita-virgen',
    type: 'memory',
    title: 'Nuestra Tercera Cita · Paseo por Plaza de la Virgen',
    subtitle: 'Plaça de la Mare de Déu, Ciutat Vella, València, Valencia, Spain',
    description: 'El 15 de diciembre de 2024 paseando por la calle y la Plaza de la Virgen iluminada, sintiendo cada vez más complicidad y magia.',
    latitude: 39.476283,
    longitude: -0.375531,
    precision: 'exact',
    date: '2024-12-15',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Complicidad & Ternura',
  },
  {
    id: 'memory-primera-foto-padres',
    type: 'memory',
    title: 'La primera foto que le enviamos a sus padres',
    subtitle: 'C/ de Sant Martí, 1, Ciutat Vella, 46002 València, Valencia, Spain',
    description: 'El 27 de diciembre de 2024: la primera fotografía que compartimos con la familia con toda la ilusión del mundo.',
    latitude: 39.473465,
    longitude: -0.375701,
    precision: 'exact',
    date: '2024-12-27',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Ilusión compartida',
  },
  {
    id: 'memory-honest-greens',
    type: 'restaurant',
    title: 'Cuando descubrimos Honest Greens',
    subtitle: 'C/ dels Cavallers, 24, Ciutat Vella, 46001 València, Valencia, Spain',
    description: 'El 30 de diciembre de 2024: el día que descubrimos nuestro rincón favorito de comida rica y saludable en la calle Caballeros.',
    latitude: 39.476716,
    longitude: -0.378041,
    precision: 'exact',
    date: '2024-12-30',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'memory-etapa-canet',
    type: 'stage',
    title: "Nuestra etapa en Canet d'en Berenguer",
    subtitle: "Platja de Canet d'en Berenguer, 46529 Canet d'en Berenguer, Valencia, Spain",
    description: 'Desde el 5 de enero de 2025 hasta noviembre de 2025: meses maravillosos viviendo juntos frente al mar, atardeceres dorados y paseos infinitos por la playa.',
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
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'memory-segundo-airbnb',
    type: 'memory',
    title: 'Nuestro Segundo Airbnb Romántico',
    subtitle: 'Carrer de la Bosseria, Ciutat Vella, 46001 València, Valencia, Spain',
    description: 'Del 21 al 23 de enero de 2025. Un recuerdo sumamente especial para los dos: fue aquí donde nos dimos cuenta de que estábamos profundamente enamorados el uno del otro.',
    latitude: 39.475282,
    longitude: -0.379935,
    precision: 'exact',
    date: '2025-01-21',
    hasDateRange: true,
    dateRangeEnd: '2025-01-23',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Donde supimos que estábamos enamorados',
  },
  {
    id: 'restaurant-don-salvatore',
    type: 'restaurant',
    title: 'Cena en Ristorante Don Salvatore',
    subtitle: "Carrer del Comte d'Altea, 48, L'Eixample, 46005 València, Valencia, Spain",
    description: 'El 22 de enero de 2025 cenando pasta auténtica italiana en Don Salvatore durante nuestros días de Airbnb.',
    latitude: 39.467094,
    longitude: -0.365227,
    precision: 'exact',
    date: '2025-01-22',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'memory-conocer-padres-manises',
    type: 'memory',
    title: 'Primera vez que fui a conocer a sus padres',
    subtitle: 'Carrer Xàtiva, 25, 46940 Manises, Valencia, Spain',
    description: 'El 28 de enero de 2025 en Carrer Xàtiva 25, Manises. Una tarde llena de emoción, acogida y el comienzo de muchísimos momentos con su familia.',
    latitude: 39.496584,
    longitude: -0.472972,
    precision: 'exact',
    date: '2025-01-28',
    city: 'Manises',
    photos: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Acogida & Familia',
  },
  {
    id: 'memory-merienda-mercado-colon',
    type: 'date',
    title: 'Sitio que nos encantó merendar · Mercado de Colón',
    subtitle: "Carrer de Jorge Juan, 19, L'Eixample, 46004 València, Valencia, Spain",
    description: 'El 11 de febrero de 2025: merienda deliciosa y café en nuestro rincón favorito cerca del Mercado de Colón.',
    latitude: 39.468969,
    longitude: -0.368355,
    precision: 'exact',
    date: '2025-02-11',
    invitedBy: 'both',
    destination1: 'Mercado de Colón',
    destination2: 'Paseo por Jorge Juan y Calle Colón',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'memory-tercer-mejor-airbnb',
    type: 'memory',
    title: 'Nuestro Tercer y Mejor Airbnb Romántico',
    subtitle: 'Pg. de l\'Albereda, València, Valencia, Spain',
    description: 'Del 13 al 16 de febrero de 2025. El mejor fin de semana de nuestras vidas: San Valentín, complicidad absoluta y nuestro compromiso oficial de empezar a salir juntos.',
    latitude: 39.464377,
    longitude: -0.358492,
    precision: 'exact',
    date: '2025-02-13',
    hasDateRange: true,
    dateRangeEnd: '2025-02-16',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Inolvidable · San Valentín',
  },
  {
    id: 'restaurant-casa-daragona-sanvalentin',
    type: 'restaurant',
    title: "San Valentín en Ristorante Casa d'Aragona",
    subtitle: "Carrer de Ciscar, 12, L'Eixample, 46005 València, Valencia, Spain",
    description: "El 14 de febrero de 2025: cena romántica de San Valentín a la luz de las velas en Casa d'Aragona.",
    latitude: 39.466880,
    longitude: -0.366384,
    precision: 'exact',
    date: '2025-02-14',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'milestone-primer-beso-pareja',
    type: 'memory',
    title: 'Primer Beso & Donde Empezamos a Salir',
    subtitle: "Pg. de l'Albereda, 44, Camins al Grau, 46023 València, Valencia, Spain",
    description: "El 15 de febrero de 2025 en el Paseo de la Alameda, 44. El rincón mágico de nuestro primer beso y donde Tonet le pidió salir a Andrea. El comienzo oficial de nuestro camino juntos.",
    latitude: 39.458650,
    longitude: -0.350807,
    precision: 'exact',
    date: '2025-02-15',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop'
    ],
    emotionTag: 'Aniversario Oficial & Primer Beso',
  },
  {
    id: 'place-casa-tonet',
    type: 'stage',
    title: 'Nuestra etapa en Carrer Comte del Real',
    subtitle: 'Carrer Comte Del Real, 16, 46194 Real, Valencia, Spain',
    description: 'Calle Conde de Real, 16. Nuestro hogar y refugio de amor compartido donde viví y construimos innumerables momentos juntos.',
    latitude: 39.335177,
    longitude: -0.611326,
    precision: 'exact',
    date: '2025-03-01',
    startDate: '2025-03-01',
    isOngoing: true,
    stageSummary: 'Nuestro hogar y refugio de amor compartido',
    city: 'Real',
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'restaurant-latte-farina',
    type: 'restaurant',
    title: 'Cuando fuimos a Latte & Farina',
    subtitle: 'Pl. del Miracle del Mocadoret, 6, Ciutat Vella, 46001 València, Valencia, Spain',
    description: 'El 10 de mayo de 2025: comida italiana deliciosa y postres artesanales en una de las plazas más bonitas del centro.',
    latitude: 39.474352,
    longitude: -0.376296,
    precision: 'exact',
    date: '2025-05-10',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'restaurant-casa-daragona-mayo',
    type: 'restaurant',
    title: "Cena en Casa d'Aragona (Mayo)",
    subtitle: "Carrer de Ciscar, 12, L'Eixample, 46005 València, Valencia, Spain",
    description: "El 11 de mayo de 2025: otra cena inolvidable compartiendo pasta fresca en Casa d'Aragona.",
    latitude: 39.466880,
    longitude: -0.366384,
    precision: 'exact',
    date: '2025-05-11',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop'
    ],
  },
  {
    id: 'restaurant-le-favole',
    type: 'restaurant',
    title: 'Cuando fuimos a Ristorante Le Favole',
    subtitle: "C/ de l'Hedra, 5, Ciutat Vella, 46001 València, Valencia, Spain",
    description: 'En el verano de 2025: noche cálida de risas, confidencias y gastronomía italiana en la terraza de Le Favole.',
    latitude: 39.472237,
    longitude: -0.378451,
    precision: 'exact',
    date: '2025-07-15',
    city: 'València',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ],
  }
];

async function seedRichPlaces() {
  console.log('Seeding all 18 places with full metadata...');

  const dbRows = DEMO_PLACES.map((p) => ({
    id: p.id,
    couple_id: 'andrea-tonet',
    author_id: '11111111-aaaa-bbbb-cccc-111111111111',
    title: p.title,
    subtitle: p.subtitle,
    city_name: p.city,
    country: 'España',
    country_code: 'ES',
    lat: p.latitude,
    lng: p.longitude,
    date: p.date,
    story: p.description,
    category: p.type,
    mood_tag: encodePlaceMetadata(p),
    photos: p.photos,
    location_precision: p.precision,
    visibility: 'couple',
    is_milestone: false,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await client.from('map_places').upsert(dbRows);
  if (error) {
    console.error('Error seeding places:', error);
  } else {
    console.log('✅ Successfully seeded all 18 places with full rich metadata to Supabase Cloud!');
  }
}

seedRichPlaces().catch(console.error);
