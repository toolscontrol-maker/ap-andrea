import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const COUPLE_ID = 'andrea-tonet';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SAVED_PLACES = [
  {
    id: 'place-rest-alqueria-pou',
    couple_id: COUPLE_ID,
    created_by_user_id: '11111111-aaaa-bbbb-cccc-111111111111',
    name: 'Restaurante Alqueria del Pou',
    category: 'restaurant',
    status: 'favorite',
    address: "Entrada del Pou d'Aparisi, 2, Quatre Carreres, 46013 València",
    city: 'Valencia',
    country: 'España',
    country_code: 'ES',
    phone_number: '+34 962 11 04 46',
    google_maps_url: 'https://maps.google.com/?q=Alqueria+del+Pou+Valencia',
    latitude: 39.4491,
    longitude: -0.3664,
    cuisine: ['Mediterránea', 'Arroces tradicionales', 'Cocina de la Huerta'],
    price_level: 2,
    vibe: 'romantico',
    tags: ['primera_cita', 'favorito', 'arroces', 'recuerdo_eterno'],
    rating_personal: 5,
    note: 'Nuestra primera cita oficial el 5 de diciembre de 2024 en plena huerta valenciana. Risas, confidencias y donde supimos que queríamos estar juntos.',
    cover_image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-pou-1',
        date: '2024-12-05',
        title: 'Nuestra Primera Cita Oficial',
        note: 'La noche que lo cambió todo. Confidencias y miradas que nunca olvidaremos.'
      }
    ],
    created_at: '2024-12-05T21:00:00Z',
    updated_at: '2024-12-05T23:30:00Z'
  },
  {
    id: 'place-rest-pasta-passione',
    couple_id: COUPLE_ID,
    created_by_user_id: '11111111-aaaa-bbbb-cccc-111111111111',
    name: 'Pasta & Passione',
    category: 'restaurant',
    status: 'favorite',
    address: 'Carrer dels Juristes, 5, Ciutat Vella, 46001 València',
    city: 'Valencia',
    country: 'España',
    country_code: 'ES',
    phone_number: '+34 960 04 88 64',
    google_maps_url: 'https://maps.google.com/?q=Pasta+e+Passione+Valencia',
    latitude: 39.4756,
    longitude: -0.3765,
    cuisine: ['Italiana auténtica', 'Pasta fresca', 'Tiramisú'],
    price_level: 2,
    vibe: 'romantico',
    tags: ['primer_italiano', 'pasta_fresca', 'el_carmen', 'favorito'],
    rating_personal: 5,
    note: '13 de diciembre de 2024: La primera vez que fuimos juntos a un restaurante italiano en Valencia. Pasta fresca deliciosa y postres caseros.',
    cover_image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-pasta-1',
        date: '2024-12-13',
        title: 'Primera vez en un italiano juntos',
        note: 'Cena deliciosa de pasta fresca y risas compartidas en El Carmen.'
      }
    ],
    created_at: '2024-12-13T21:00:00Z',
    updated_at: '2024-12-13T23:00:00Z'
  },
  {
    id: 'place-rest-honest-greens',
    couple_id: COUPLE_ID,
    created_by_user_id: '22222222-dddd-eeee-ffff-222222222222',
    name: 'Honest Greens',
    category: 'restaurant',
    status: 'favorite',
    address: 'Carrer dels Cavallers, 24, Ciutat Vella, 46001 València',
    city: 'Valencia',
    country: 'España',
    country_code: 'ES',
    phone_number: '+34 960 66 01 23',
    google_maps_url: 'https://maps.google.com/?q=Honest+Greens+Valencia',
    latitude: 39.4764,
    longitude: -0.3779,
    cuisine: ['Healthy Food', 'Plant-based & Grill', 'Specialty Coffee'],
    price_level: 2,
    vibe: 'casual',
    tags: ['comida_saludable', 'centro_valencia', 'favorito_andrea'],
    rating_personal: 5,
    note: 'El sitio favorito de Andrea para comer sano, rico y con una energía preciosa en pleno centro.',
    cover_image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop'
    ],
    visits: [],
    created_at: '2024-12-20T14:00:00Z',
    updated_at: '2024-12-20T16:00:00Z'
  }
];

const WISHES = [
  {
    id: 'wish-viaje-paris-2025',
    couple_id: COUPLE_ID,
    owner_user_id: '22222222-dddd-eeee-ffff-222222222222',
    created_by_user_id: '11111111-aaaa-bbbb-cccc-111111111111',
    title: 'Escapada Romántica a París',
    description: 'Pasear de la mano por el Sena, subir a Montmartre y cenar en un bistró con velas.',
    type: 'travel',
    status: 'dreaming',
    visibility: 'shared',
    brand: 'Viaje Soñado',
    estimated_price: 600,
    currency: 'EUR',
    desired_for: 'Próximas vacaciones',
    tags: ['viaje', 'paris', 'romantico', 'sueno'],
    is_for_self: false,
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z'
  },
  {
    id: 'wish-bolso-zara-atelier',
    couple_id: COUPLE_ID,
    owner_user_id: '22222222-dddd-eeee-ffff-222222222222',
    created_by_user_id: '22222222-dddd-eeee-ffff-222222222222',
    title: 'Bolso de Piel Minimalista',
    description: 'Bolso estructurado en tono marfil con detalles dorados para ocasiones especiales.',
    type: 'fashion',
    status: 'dreaming',
    visibility: 'shared',
    brand: 'Zara / Massimo Dutti',
    estimated_price: 89.95,
    currency: 'EUR',
    desired_for: 'Cumpleaños o sorpresa',
    tags: ['moda', 'bolso', 'regalo'],
    is_for_self: true,
    created_at: '2025-01-10T12:00:00Z',
    updated_at: '2025-01-10T12:00:00Z'
  }
];

async function seedCloud() {
  console.log('Seeding Supabase Cloud tables with permanent shared data...');

  const { error: spErr } = await client.from('saved_places').upsert(SAVED_PLACES, { onConflict: 'id' });
  console.log('Saved places upsert status:', spErr || 'SUCCESS');

  const { error: wErr } = await client.from('wishes').upsert(WISHES, { onConflict: 'id' });
  console.log('Wishes upsert status:', wErr || 'SUCCESS');

  // Verify profiles
  const { data: profs, error: pErr } = await client.from('profiles').select('*');
  console.log('Profiles in cloud:', profs, 'Error:', pErr);
}

seedCloud();
