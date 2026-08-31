import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  MapPlace,
  CalendarEvent,
  CoupleEvent,
  CoupleEventType,
  RevealPolicy,
  AyaQuestionPrompt,
  DiaryEntryUI,
  WishlistItem,
  WishlistStatus,
  Place,
  MemoryEntry,
  RitualSeed,
  WeeklyRitualSummary
} from '@andrea/types';
import { StorageEngine, STORAGE_KEYS } from '../services/storage';
import { CloudSyncEngine } from '../services/cloud-sync/CloudSyncEngine';

export const AUTH_SESSION_KEY = 'andrea_auth_session_v7';
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface DevUser {
  id: string;
  name: string;
  avatar: string;
  avatarPhoto?: string;
  roleDescription: string;
  birthday?: string;
}

export const DEV_USERS: { user1: DevUser; user2: DevUser } = {
  user1: {
    id: '11111111-aaaa-bbbb-cccc-111111111111',
    name: 'Tonet',
    avatar: 'T',
    avatarPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
    roleDescription: 'Quien suele iniciar planes y documentar detalles',
    birthday: '19 de Octubre',
  },
  user2: {
    id: '22222222-dddd-eeee-ffff-222222222222',
    name: 'Andrea',
    avatar: 'A',
    avatarPhoto: 'https://qxnsksrdqmrsjsqxyxtq.supabase.co/storage/v1/object/public/andrea-media/avatars/avatar_user2_1788120276429.jpg',
    roleDescription: 'Quien da significado y aporta calidez espontánea',
    birthday: '1 de Septiembre',
  }
};

export const INITIAL_WISHES: WishlistItem[] = [
  {
    id: 'wish-viaje-paris-2025',
    coupleId: 'andrea-tonet',
    ownerUserId: DEV_USERS.user2.id,
    createdByUserId: DEV_USERS.user1.id,
    title: 'Escapada Romántica a París',
    description: 'Pasear de la mano por el Sena, subir a Montmartre y cenar en un bistró con velas.',
    type: 'travel',
    status: 'dreaming',
    visibility: 'shared',
    brand: 'Viaje Soñado',
    estimatedPrice: 600,
    currency: 'EUR',
    desiredFor: 'Próximas vacaciones',
    tags: ['viaje', 'paris', 'romantico', 'sueno'],
    isForSelf: false,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'wish-bolso-zara-atelier',
    coupleId: 'andrea-tonet',
    ownerUserId: DEV_USERS.user2.id,
    createdByUserId: DEV_USERS.user2.id,
    title: 'Bolso de Piel Minimalista',
    description: 'Bolso estructurado en tono marfil con detalles dorados para ocasiones especiales.',
    type: 'fashion',
    status: 'dreaming',
    visibility: 'shared',
    brand: 'Zara / Massimo Dutti',
    estimatedPrice: 89.95,
    currency: 'EUR',
    desiredFor: 'Cumpleaños o sorpresa',
    tags: ['moda', 'bolso', 'regalo'],
    isForSelf: true,
    createdAt: '2025-01-10T12:00:00Z',
    updatedAt: '2025-01-10T12:00:00Z',
  },
];

export const INITIAL_SAVED_PLACES: Place[] = [
  {
    id: 'place-rest-alqueria-pou',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user1.id,
    name: 'Restaurante Alqueria del Pou',
    category: 'restaurant',
    status: 'favorite',
    address: "Entrada del Pou d'Aparisi, 2, Quatre Carreres, 46013 València",
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 962 11 04 46',
    googleMapsUrl: 'https://maps.google.com/?q=Alqueria+del+Pou+Valencia',
    latitude: 39.4491,
    longitude: -0.3664,
    cuisine: ['Mediterránea', 'Arroces tradicionales', 'Cocina de la Huerta'],
    priceLevel: 2,
    vibe: 'romantico',
    tags: ['primera_cita', 'favorito', 'arroces', 'recuerdo_eterno'],
    ratingPersonal: 5,
    note: 'Nuestra primera cita oficial el 5 de diciembre de 2024 en plena huerta valenciana. Risas, confidencias y donde supimos que queríamos estar juntos.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
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
    createdAt: '2024-12-05T21:00:00Z',
    updatedAt: '2024-12-05T23:30:00Z'
  },
  {
    id: 'place-rest-pasta-passione',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user1.id,
    name: 'Pasta & Passione',
    category: 'restaurant',
    status: 'favorite',
    address: 'Carrer dels Juristes, 5, Ciutat Vella, 46001 València',
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 960 04 88 64',
    googleMapsUrl: 'https://maps.google.com/?q=Pasta+e+Passione+Valencia',
    latitude: 39.4756,
    longitude: -0.3765,
    cuisine: ['Italiana auténtica', 'Pasta fresca', 'Tiramisú'],
    priceLevel: 2,
    vibe: 'romantico',
    tags: ['primer_italiano', 'pasta_fresca', 'el_carmen', 'favorito'],
    ratingPersonal: 5,
    note: '13 de diciembre de 2024: La primera vez que fuimos juntos a un restaurante italiano en Valencia. Pasta fresca deliciosa y postres caseros.',
    coverImageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop',
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
    createdAt: '2024-12-13T21:00:00Z',
    updatedAt: '2024-12-13T23:00:00Z'
  },
  {
    id: 'place-rest-honest-greens',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user2.id,
    name: 'Honest Greens',
    category: 'restaurant',
    status: 'favorite',
    address: 'Carrer dels Cavallers, 24, Ciutat Vella, 46001 València',
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    googleMapsUrl: 'https://maps.google.com/?q=Honest+Greens+Calle+Caballeros+Valencia',
    latitude: 39.4766,
    longitude: -0.3786,
    cuisine: ['Healthy Food', 'Plant-based', 'Bowls de autor', 'Café'],
    priceLevel: 2,
    vibe: 'informal',
    tags: ['saludable', 'caballeros', 'favorito', 'diario'],
    ratingPersonal: 5,
    note: 'Descubierto el 30 de diciembre de 2024: nuestro sitio imprescindible de comida sana, rica y fresca en la calle Caballeros.',
    coverImageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-honest-1',
        date: '2024-12-30',
        title: 'Descubrimos Honest Greens',
        note: 'El comienzo de una de nuestras costumbres favoritas en el centro.'
      }
    ],
    createdAt: '2024-12-30T14:00:00Z',
    updatedAt: '2024-12-30T14:00:00Z'
  },
  {
    id: 'place-rest-don-salvatore',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user1.id,
    name: 'Ristorante Don Salvatore',
    category: 'restaurant',
    status: 'visited',
    address: "Carrer del Comte d'Altea, 48, L'Eixample, 46005 València",
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 963 74 38 67',
    googleMapsUrl: 'https://maps.google.com/?q=Don+Salvatore+Conde+Altea+Valencia',
    latitude: 39.4671,
    longitude: -0.3652,
    cuisine: ['Italiana tradicional', 'Pizzas al horno de leña', 'Pasta'],
    priceLevel: 2,
    vibe: 'romantico',
    tags: ['italiano', 'conde_altea', 'segundo_airbnb', 'cena_romantica'],
    ratingPersonal: 5,
    note: '22 de enero de 2025: Cena romántica en Conde de Altea durante nuestros días del segundo Airbnb.',
    coverImageUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-don-1',
        date: '2025-01-22',
        title: 'Cena en Don Salvatore',
        note: 'Durante nuestro segundo Airbnb romántico donde supimos que estábamos enamorados.'
      }
    ],
    createdAt: '2025-01-22T21:30:00Z',
    updatedAt: '2025-01-22T21:30:00Z'
  },
  {
    id: 'place-cafe-mercado-colon',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user1.id,
    name: 'Merienda cerca del Mercado de Colón',
    category: 'cafe',
    status: 'favorite',
    address: "Carrer de Jorge Juan, 19, L'Eixample, 46004 València",
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    googleMapsUrl: 'https://maps.google.com/?q=Mercado+de+Colon+Valencia',
    latitude: 39.4691,
    longitude: -0.3691,
    cuisine: ['Café de Especialidad', 'Pastelería artesanal', 'Meriendas'],
    priceLevel: 2,
    vibe: 'tranquilo',
    tags: ['merienda', 'cafe', 'mercado_colon', 'tardes_juntos'],
    ratingPersonal: 5,
    note: '11 de febrero de 2025: Nuestro sitio que nos encantó para merendar y desconectar juntos cerca del Mercado de Colón.',
    coverImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-colon-1',
        date: '2025-02-11',
        title: 'Tarde de merienda favorita',
        note: 'Tarde dulce y tranquila en vísperas de San Valentín.'
      }
    ],
    createdAt: '2025-02-11T17:30:00Z',
    updatedAt: '2025-02-11T17:30:00Z'
  },
  {
    id: 'place-rest-casa-daragona',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user1.id,
    name: "Ristorante Casa d'Aragona",
    category: 'restaurant',
    status: 'favorite',
    address: 'Carrer dels Cavallers, 21, Ciutat Vella, 46001 València',
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 963 81 22 45',
    googleMapsUrl: 'https://maps.google.com/?q=Casa+dAragona+Calle+Caballeros+Valencia',
    latitude: 39.4766,
    longitude: -0.3780,
    cuisine: ['Italiana de autor', 'Pizza Napolitana', 'Pasta fresca al dente', 'Vinos'],
    priceLevel: 2,
    vibe: 'celebracion',
    tags: ['san_valentin', 'favorito_eterno', 'celebraciones', 'romantico', 'muros_historicos'],
    ratingPersonal: 5,
    note: "Nuestro gran templo romántico entre muros árabes y techos altos. El escenario de San Valentín (14-02-2025), nuestra cena de mayo (11-05-2025) y verano (15-08-2025).",
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-aragona-1',
        date: '2025-02-14',
        title: 'Cena de San Valentín',
        note: 'Cena a la luz de las velas durante nuestro fin de semana más especial.'
      },
      {
        id: 'v-aragona-2',
        date: '2025-05-11',
        title: 'Cena romántica de Mayo',
        note: 'Celebrando nuestro amor compartiendo pasta y vino.'
      },
      {
        id: 'v-aragona-3',
        date: '2025-08-15',
        title: 'Noche de Verano en Casa d\'Aragona',
        note: 'Cena mágica de verano en nuestro rincón favorito.'
      }
    ],
    createdAt: '2025-02-14T21:30:00Z',
    updatedAt: '2025-08-15T22:00:00Z'
  },
  {
    id: 'place-rest-latte-farina',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user1.id,
    name: 'Latte & Farina',
    category: 'restaurant',
    status: 'visited',
    address: 'Plaza del Miracle del Mocadoret, 6, Ciutat Vella, 46001 València',
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 963 91 80 50',
    googleMapsUrl: 'https://maps.google.com/?q=Latte+Farina+Valencia',
    latitude: 39.4743,
    longitude: -0.3764,
    cuisine: ['Italiana', 'Pizzas artesanas', 'Postres caseros'],
    priceLevel: 2,
    vibe: 'romantico',
    tags: ['italiano', 'plaza_bonita', 'mayo_2025', 'comida_juntos'],
    ratingPersonal: 5,
    note: '10 de mayo de 2025: comida italiana deliciosa y paseo en una de las plazas más bonitas del centro histórico.',
    coverImageUrl: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-latte-1',
        date: '2025-05-10',
        title: 'Comida en Latte & Farina',
        note: 'Pasta deliciosa y sobremesa en la plaza.'
      }
    ],
    createdAt: '2025-05-10T14:30:00Z',
    updatedAt: '2025-05-10T14:30:00Z'
  },
  {
    id: 'place-rest-le-favole',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user2.id,
    name: 'Ristorante Le Favole',
    category: 'restaurant',
    status: 'visited',
    address: "Carrer de l'Hedra, 4, Ciutat Vella, 46001 València",
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 963 91 00 37',
    googleMapsUrl: 'https://maps.google.com/?q=Le+Favole+Calle+Hedra+Valencia',
    latitude: 39.4727,
    longitude: -0.3784,
    cuisine: ['Italiana gourmet', 'Pasta fresca', 'Terraza de verano'],
    priceLevel: 2,
    vibe: 'romantico',
    tags: ['verano_2025', 'italiano', 'terraza_con_encanto'],
    ratingPersonal: 5,
    note: 'Verano de 2025 (15 de julio): noche cálida de risas y cena en la terraza de Le Favole.',
    coverImageUrl: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-favole-1',
        date: '2025-07-15',
        title: 'Cena de verano en Le Favole',
        note: 'Terraza de cuento bajo el cielo de verano de Valencia.'
      }
    ],
    createdAt: '2025-07-15T22:00:00Z',
    updatedAt: '2025-07-15T22:00:00Z'
  },
  {
    id: 'place-rest-la-salvaora',
    coupleId: 'andrea-tonet',
    createdByUserId: DEV_USERS.user1.id,
    name: 'Restaurante La Salvaora',
    category: 'restaurant',
    status: 'visited',
    address: 'Carrer de Calatrava, 19, Ciutat Vella, 46001 València',
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 963 92 48 55',
    googleMapsUrl: 'https://maps.google.com/?q=La+Salvaora+Calle+Calatrava+Valencia',
    latitude: 39.4763,
    longitude: -0.3774,
    cuisine: ['Cocina mediterránea creativa', 'Tapas de autor', 'Tarta de queso'],
    priceLevel: 2,
    vibe: 'celebracion',
    tags: ['9_meses', 'celebracion', 'aniversario_meses', 'calatrava'],
    ratingPersonal: 5,
    note: '15 de noviembre de 2025: Celebrando nuestros 9 meses juntos con una cena romántica e íntima.',
    coverImageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop'
    ],
    visits: [
      {
        id: 'v-salvaora-1',
        date: '2025-11-15',
        title: 'Celebración de 9 Meses Juntos',
        note: 'Celebrando 9 meses de amor incondicional en una cena íntima.'
      }
    ],
    createdAt: '2025-11-15T21:30:00Z',
    updatedAt: '2025-11-15T21:30:00Z'
  }
];

export const INITIAL_RITUAL_SEEDS: RitualSeed[] = [];

export const SAMPLE_MAP_PLACES: MapPlace[] = [
  {
    id: 'place-milestone-room',
    title: 'Donde nos conocimos · Ent. Rico, 6',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4497,
    lng: -0.3672,
    date: '2024-11-23',
    story: 'La noche mágica del 23 de noviembre de 2024 en Ent. Rico, 6 (Quatre Carreres, Valencia) donde cruzamos miradas y nos conocimos por primera vez. Esa noche empezó nuestra historia.',
    category: 'primer_encuentro',
    moodTag: 'grateful',
    photos: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-milestone-pou',
    title: 'Nuestra Primera Cita · Alqueria del Pou',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 41.8992,
    lng: -0.3664,
    date: '2024-12-05',
    story: "Nuestra primera cita oficial en el restaurante Alqueria del Pou (Entrada del Pou d'Aparisi, 2, Quatre Carreres, Valencia). Risas, confidencias y donde supimos que queríamos estar juntos.",
    category: 'cita',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-pasta-passione',
    title: 'Primera vez en un italiano · Pasta e Passione',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4756,
    lng: -0.3765,
    date: '2024-12-13',
    story: 'El 13 de diciembre de 2024 en Carrer dels Juristes, 5. Nuestra primera cena italiana juntos en Valencia, compartiendo pasta deliciosa y complicidad.',
    category: 'cita',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-tercera-cita-virgen',
    title: 'Nuestra Tercera Cita · Plaza de la Virgen',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4766,
    lng: -0.3750,
    date: '2024-12-15',
    story: 'El 15 de diciembre de 2024: paseo por la calle y la Plaza de la Virgen iluminada, sintiendo cada vez más complicidad y magia.',
    category: 'cita',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-honest-greens',
    title: 'Cuando descubrimos Honest Greens',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4766,
    lng: -0.3786,
    date: '2024-12-30',
    story: 'El 30 de diciembre de 2024: el día que descubrimos nuestro rincón favorito de comida rica y saludable en Carrer dels Cavallers, 24.',
    category: 'cita',
    moodTag: 'happy',
    photos: ['https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user2.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: false,
  },
  {
    id: 'place-etapa-canet',
    title: "Nuestra etapa en Canet d'en Berenguer",
    cityName: "Canet d'en Berenguer",
    country: 'España',
    countryCode: 'ES',
    lat: 39.6799,
    lng: -0.2201,
    date: '2025-01-05',
    story: "Desde el 5 de enero hasta noviembre de 2025: meses maravillosos viviendo junto al mar en la playa de Canet, atardeceres y paseos infinitos.",
    category: 'viaje',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-segundo-airbnb',
    title: 'Nuestro Segundo Airbnb Romántico',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4735,
    lng: -0.3755,
    date: '2025-01-21',
    story: 'Del 21 al 23 de enero de 2025. Un recuerdo sumamente especial para los dos: fue aquí donde nos dimos cuenta de que estábamos profundamente enamorados el uno del otro.',
    category: 'especial',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user2.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-padres-manises',
    title: 'Primera vez que fui a conocer a sus padres',
    cityName: 'Manises',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4966,
    lng: -0.4729,
    date: '2025-01-28',
    story: 'El 28 de enero de 2025 en Carrer Xàtiva 25, Manises. Una tarde llena de emoción, acogida familiar y el comienzo de muchísimos días compartidos juntos.',
    category: 'especial',
    moodTag: 'grateful',
    photos: ['https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-merienda-colon',
    title: 'Merienda cerca del Mercado de Colón',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4691,
    lng: -0.3691,
    date: '2025-02-11',
    story: 'El 11 de febrero de 2025: merienda deliciosa y café en nuestro rincón favorito cerca del Mercado de Colón.',
    category: 'cita',
    moodTag: 'happy',
    photos: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: false,
  },
  {
    id: 'place-tercer-airbnb',
    title: 'Nuestro Tercer y Mejor Airbnb Romántico',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4640,
    lng: -0.3550,
    date: '2025-02-13',
    story: 'Del 13 al 16 de febrero de 2025. El mejor fin de semana de nuestras vidas: San Valentín, complicidad absoluta y nuestro compromiso oficial de empezar a salir juntos.',
    category: 'especial',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-milestone-anniversary',
    title: 'Primer Beso & Empezamos a Salir · Alameda',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4632,
    lng: -0.3546,
    date: '2025-02-15',
    story: "El 15 de febrero de 2025 en Pg. de l'Albereda, 44 (Camins al Grau, Valencia). El rincón mágico donde nos dimos nuestro primer beso y donde Tonet le pidió salir a Andrea. El comienzo oficial de nuestra historia de amor.",
    category: 'especial',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user2.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-casa-tonet',
    title: 'Casa de Tonet · Conde de Real',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4768,
    lng: -0.3734,
    date: '2025-03-01',
    story: 'Calle Conde de Real, 16B, Valencia. Nuestro hogar y nido de amor compartido.',
    category: 'especial',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-latte-farina',
    title: 'Comida en Latte & Farina',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4743,
    lng: -0.3764,
    date: '2025-05-10',
    story: 'El 10 de mayo de 2025: comida italiana deliciosa y postres artesanales en la Plaza del Miracle del Mocadoret, 6.',
    category: 'cita',
    moodTag: 'happy',
    photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: false,
  },
  {
    id: 'place-le-favole',
    title: 'Cena de verano en Le Favole',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4727,
    lng: -0.3784,
    date: '2025-07-15',
    story: "En el verano de 2025: noche cálida de risas y gastronomía italiana en Carrer de l'Hedra, 4.",
    category: 'cita',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user2.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: false,
  },
  {
    id: 'place-salvaora-9meses',
    title: 'Celebración de 9 Meses · La Salvaora',
    cityName: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    lat: 39.4763,
    lng: -0.3774,
    date: '2025-11-15',
    story: 'El 15 de noviembre de 2025: celebrando 9 meses de amor incondicional en el restaurante La Salvaora (Carrer de Calatrava, 19).',
    category: 'especial',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
];

export const INITIAL_ENTRIES: DiaryEntryUI[] = [];

export const INITIAL_COUPLE_EVENTS: CoupleEvent[] = [
  // 1. Donde nos conocimos (23 Nov 2024)
  {
    id: 'cev-first-met',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2024-11-23',
    time: '23:30',
    actualStartAt: '2024-11-23T23:30:00',
    ownerView: {
      title: '✨ Donde nos conocimos · Ent. Rico, 6',
      subtitle: '23 de Noviembre de 2024 · Ent. Rico, 6, Quatre Carreres · La noche que empezó nuestra historia.',
      locationName: 'Ent. Rico, 6, Quatre Carreres, 46013 Valencia',
    },
    partnerView: {
      title: '✨ Donde nos conocimos · Ent. Rico, 6',
      subtitle: '23 de Noviembre de 2024 · Ent. Rico, 6, Quatre Carreres · La noche que empezó nuestra historia.',
      locationName: 'Ent. Rico, 6, Quatre Carreres, 46013 Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2024-11-23T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 2. Primera Cita (5 Dic 2024)
  {
    id: 'cev-first-date',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2024-12-05',
    time: '21:00',
    actualStartAt: '2024-12-05T21:00:00',
    ownerView: {
      title: '🍽️ Nuestra Primera Cita · Alqueria del Pou',
      subtitle: "5 de Diciembre de 2024 · Alqueria del Pou (Ent. del Pou d'Aparisi, 2) · Supimos que queríamos estar juntos.",
      locationName: "Restaurante Alqueria del Pou, Entrada del Pou d'Aparisi, 2, 46013 Valencia",
    },
    partnerView: {
      title: '🍽️ Nuestra Primera Cita · Alqueria del Pou',
      subtitle: "5 de Diciembre de 2024 · Alqueria del Pou (Ent. del Pou d'Aparisi, 2) · Supimos que queríamos estar juntos.",
      locationName: "Restaurante Alqueria del Pou, Entrada del Pou d'Aparisi, 2, 46013 Valencia",
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2024-12-05T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 3. Primer Italiano · Pasta e Passione (13 Dic 2024)
  {
    id: 'cev-pasta-passione',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2024-12-13',
    time: '21:30',
    actualStartAt: '2024-12-13T21:30:00',
    ownerView: {
      title: '🍝 Primera vez en un italiano · Pasta e Passione',
      subtitle: '13 de Diciembre de 2024 · Carrer dels Juristes, 5 · Nuestra primera cena italiana juntos.',
      locationName: 'Pasta & Passione, Carrer dels Juristes, 5, 46001 Valencia',
    },
    partnerView: {
      title: '🍝 Primera vez en un italiano · Pasta e Passione',
      subtitle: '13 de Diciembre de 2024 · Carrer dels Juristes, 5 · Nuestra primera cena italiana juntos.',
      locationName: 'Pasta & Passione, Carrer dels Juristes, 5, 46001 Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2024-12-13T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 4. Tercera Cita · Plaza de la Virgen (15 Dic 2024)
  {
    id: 'cev-tercera-cita',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2024-12-15',
    time: '19:00',
    actualStartAt: '2024-12-15T19:00:00',
    ownerView: {
      title: '🏛️ Nuestra Tercera Cita · Plaza de la Virgen',
      subtitle: '15 de Diciembre de 2024 · Paseo por la calle y la Plaza de la Virgen iluminada.',
      locationName: 'Plaza de la Virgen, 46003 Valencia',
    },
    partnerView: {
      title: '🏛️ Nuestra Tercera Cita · Plaza de la Virgen',
      subtitle: '15 de Diciembre de 2024 · Paseo por la calle y la Plaza de la Virgen iluminada.',
      locationName: 'Plaza de la Virgen, 46003 Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2024-12-15T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 5. Primera foto enviada a los padres (27 Dic 2024)
  {
    id: 'cev-primera-foto-padres',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2024-12-27',
    time: '16:00',
    actualStartAt: '2024-12-27T16:00:00',
    ownerView: {
      title: '📸 La primera foto que le enviamos a sus padres',
      subtitle: '27 de Diciembre de 2024 · Dos semanas después de empezar a conocernos.',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '📸 La primera foto que le enviamos a sus padres',
      subtitle: '27 de Diciembre de 2024 · Dos semanas después de empezar a conocernos.',
      locationName: 'Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2024-12-27T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 6. Descubrimos Honest Greens (30 Dic 2024)
  {
    id: 'cev-honest-greens',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user2.id,
    partnerId: DEV_USERS.user1.id,
    eventType: 'important_date',
    date: '2024-12-30',
    time: '14:00',
    actualStartAt: '2024-12-30T14:00:00',
    ownerView: {
      title: '🥗 Descubrimos Honest Greens (Caballeros 24)',
      subtitle: '30 de Diciembre de 2024 · Nuestro sitio preferido en el centro de Valencia.',
      locationName: 'Honest Greens, Carrer dels Cavallers, 24, 46001 Valencia',
    },
    partnerView: {
      title: '🥗 Descubrimos Honest Greens (Caballeros 24)',
      subtitle: '30 de Diciembre de 2024 · Nuestro sitio preferido en el centro de Valencia.',
      locationName: 'Honest Greens, Carrer dels Cavallers, 24, 46001 Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2024-12-30T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 7. Nuestra Etapa en Canet (5 Enero 2025 a Noviembre 2025)
  {
    id: 'cev-etapa-canet',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-01-05',
    time: '12:00',
    actualStartAt: '2025-01-05T12:00:00',
    ownerView: {
      title: "🌊 Nuestra etapa viviendo en Canet d'en Berenguer",
      subtitle: "5 de Enero de 2025 a Noviembre 2025 · Meses mágicos frente al mar.",
      locationName: "Platja de Canet d'en Berenguer, Valencia",
    },
    partnerView: {
      title: "🌊 Nuestra etapa viviendo en Canet d'en Berenguer",
      subtitle: "5 de Enero de 2025 a Noviembre 2025 · Meses mágicos frente al mar.",
      locationName: "Platja de Canet d'en Berenguer, Valencia",
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-01-05T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 8. Segundo Airbnb Romántico (21-23 Ene 2025)
  {
    id: 'cev-segundo-airbnb',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-01-21',
    time: '17:00',
    actualStartAt: '2025-01-21T17:00:00',
    ownerView: {
      title: '💫 Segundo Airbnb · Nos dimos cuenta de que estábamos enamorados',
      subtitle: '21 al 23 de Enero de 2025 · Un recuerdo sumamente especial e inolvidable.',
      locationName: 'Valencia Centro',
    },
    partnerView: {
      title: '💫 Segundo Airbnb · Nos dimos cuenta de que estábamos enamorados',
      subtitle: '21 al 23 de Enero de 2025 · Un recuerdo sumamente especial e inolvidable.',
      locationName: 'Valencia Centro',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-01-21T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 9. Don Salvatore (22 Ene 2025)
  {
    id: 'cev-don-salvatore',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-01-22',
    time: '21:30',
    actualStartAt: '2025-01-22T21:30:00',
    ownerView: {
      title: '🍷 Cena en Ristorante Don Salvatore (Conde de Altea)',
      subtitle: "22 de Enero de 2025 · Carrer del Comte d'Altea, 48.",
      locationName: "Ristorante Don Salvatore, Carrer del Comte d'Altea, 48, 46005 Valencia",
    },
    partnerView: {
      title: '🍷 Cena en Ristorante Don Salvatore (Conde de Altea)',
      subtitle: "22 de Enero de 2025 · Carrer del Comte d'Altea, 48.",
      locationName: "Ristorante Don Salvatore, Carrer del Comte d'Altea, 48, 46005 Valencia",
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-01-22T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 10. Conocer a los padres en Manises (28 Ene 2025)
  {
    id: 'cev-padres-manises',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-01-28',
    time: '18:00',
    actualStartAt: '2025-01-28T18:00:00',
    ownerView: {
      title: '🏡 Primera vez que fui a conocer a sus padres (Manises)',
      subtitle: '28 de Enero de 2025 · Carrer Xàtiva 25, Manises · El inicio de muchísimos días.',
      locationName: 'Carrer de Xàtiva, 25, 46940 Manises, Valencia',
    },
    partnerView: {
      title: '🏡 Primera vez que fui a conocer a sus padres (Manises)',
      subtitle: '28 de Enero de 2025 · Carrer Xàtiva 25, Manises · El inicio de muchísimos días.',
      locationName: 'Carrer de Xàtiva, 25, 46940 Manises, Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-01-28T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 11. Merienda Mercado de Colón (11 Feb 2025)
  {
    id: 'cev-merienda-colon',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-02-11',
    time: '17:30',
    actualStartAt: '2025-02-11T17:30:00',
    ownerView: {
      title: '☕ Sitio que nos encantó merendar (Mercado de Colón)',
      subtitle: '11 de Febrero de 2025 · Carrer de Jorge Juan, 19 · Tardes dulces juntos.',
      locationName: 'Mercado de Colón, Carrer de Jorge Juan, 19, 46004 Valencia',
    },
    partnerView: {
      title: '☕ Sitio que nos encantó merendar (Mercado de Colón)',
      subtitle: '11 de Febrero de 2025 · Carrer de Jorge Juan, 19 · Tardes dulces juntos.',
      locationName: 'Mercado de Colón, Carrer de Jorge Juan, 19, 46004 Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-02-11T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 12. Tercer y Mejor Airbnb (13-16 Feb 2025)
  {
    id: 'cev-tercer-airbnb',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-02-13',
    time: '18:00',
    actualStartAt: '2025-02-13T18:00:00',
    ownerView: {
      title: '💖 Nuestro tercer y mejor Airbnb romántico',
      subtitle: '13 al 16 de Febrero de 2025 · Fin de semana inolvidable y San Valentín.',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '💖 Nuestro tercer y mejor Airbnb romántico',
      subtitle: '13 al 16 de Febrero de 2025 · Fin de semana inolvidable y San Valentín.',
      locationName: 'Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-02-13T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 13. Casa d'Aragona (14 Feb 2025 · San Valentín)
  {
    id: 'cev-casa-daragona-sanvalentin',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-02-14',
    time: '21:30',
    actualStartAt: '2025-02-14T21:30:00',
    ownerView: {
      title: "🕯️ San Valentín en Casa d'Aragona",
      subtitle: "14 de Febrero de 2025 · Carrer de Císcar, 12 · Cena romántica a la luz de las velas.",
      locationName: "Ristorante Casa d'Aragona, Carrer de Císcar, 12, 46005 Valencia",
    },
    partnerView: {
      title: "🕯️ San Valentín en Casa d'Aragona",
      subtitle: "14 de Febrero de 2025 · Carrer de Císcar, 12 · Cena romántica a la luz de las velas.",
      locationName: "Ristorante Casa d'Aragona, Carrer de Císcar, 12, 46005 Valencia",
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-02-14T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 14. Aniversario & Primer Beso (15 Feb 2025)
  {
    id: 'cev-anniversary',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'anniversary',
    date: '2025-02-15',
    time: '22:00',
    actualStartAt: '2025-02-15T22:00:00',
    ownerView: {
      title: '❤️ Nuestro Aniversario & Primer Beso (15 de Febrero)',
      subtitle: "15 de Febrero de 2025 · Pg. de l'Albereda, 44 · Primer beso y donde le pedí salir.",
      locationName: "Pg. de l'Albereda, 44, Camins al Grau, 46023 Valencia",
    },
    partnerView: {
      title: '❤️ Nuestro Aniversario & Primer Beso (15 de Febrero)',
      subtitle: "15 de Febrero de 2025 · Pg. de l'Albereda, 44 · Primer beso y donde empezamos a salir.",
      locationName: "Pg. de l'Albereda, 44, Camins al Grau, 46023 Valencia",
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-02-15T10:00:00',
    updatedAt: '2026-02-15T23:00:00',
  },

  // 15. Latte & Farina (10 Mayo 2025)
  {
    id: 'cev-latte-farina',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-05-10',
    time: '14:30',
    actualStartAt: '2025-05-10T14:30:00',
    ownerView: {
      title: '🍕 Comida en Latte & Farina (Pl. Miracle del Mocadoret)',
      subtitle: '10 de Mayo de 2025 · Pl. del Miracle del Mocadoret, 6 · Pasta y postres ricos.',
      locationName: 'Latte & Farina, Pl. del Miracle del Mocadoret, 6, 46001 Valencia',
    },
    partnerView: {
      title: '🍕 Comida en Latte & Farina (Pl. Miracle del Mocadoret)',
      subtitle: '10 de Mayo de 2025 · Pl. del Miracle del Mocadoret, 6 · Pasta y postres ricos.',
      locationName: 'Latte & Farina, Pl. del Miracle del Mocadoret, 6, 46001 Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-05-10T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 16. Casa d'Aragona (11 Mayo 2025)
  {
    id: 'cev-casa-daragona-mayo',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-05-11',
    time: '21:30',
    actualStartAt: '2025-05-11T21:30:00',
    ownerView: {
      title: "🍝 Cena en Casa d'Aragona (Mayo)",
      subtitle: "11 de Mayo de 2025 · Carrer de Císcar, 12 · Pasta fresca y momentos bonitos.",
      locationName: "Casa d'Aragona, Carrer de Císcar, 12, 46005 Valencia",
    },
    partnerView: {
      title: "🍝 Cena en Casa d'Aragona (Mayo)",
      subtitle: "11 de Mayo de 2025 · Carrer de Císcar, 12 · Pasta fresca y momentos bonitos.",
      locationName: "Casa d'Aragona, Carrer de Císcar, 12, 46005 Valencia",
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-05-11T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 17. Le Favole (Verano 2025 · 15 Julio 2025)
  {
    id: 'cev-le-favole',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user2.id,
    partnerId: DEV_USERS.user1.id,
    eventType: 'important_date',
    date: '2025-07-15',
    time: '22:00',
    actualStartAt: '2025-07-15T22:00:00',
    ownerView: {
      title: '🌿 Cena de verano en Ristorante Le Favole',
      subtitle: "15 de Julio de 2025 · Carrer de l'Hedra, 4 · Noche mágica de verano.",
      locationName: "Le Favole, Carrer de l'Hedra, 4, 46001 Valencia",
    },
    partnerView: {
      title: '🌿 Cena de verano en Ristorante Le Favole',
      subtitle: "15 de Julio de 2025 · Carrer de l'Hedra, 4 · Noche mágica de verano.",
      locationName: "Le Favole, Carrer de l'Hedra, 4, 46001 Valencia",
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-07-15T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 18. Casa d'Aragona (15 Agosto 2025)
  {
    id: 'cev-casa-daragona-agosto',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-08-15',
    time: '21:45',
    actualStartAt: '2025-08-15T21:45:00',
    ownerView: {
      title: "✨ Noche de verano en Casa d'Aragona",
      subtitle: "15 de Agosto de 2025 · Carrer de Císcar, 12 · Celebrando el verano juntos.",
      locationName: "Casa d'Aragona, Carrer de Císcar, 12, 46005 Valencia",
    },
    partnerView: {
      title: "✨ Noche de verano en Casa d'Aragona",
      subtitle: "15 de Agosto de 2025 · Carrer de Císcar, 12 · Celebrando el verano juntos.",
      locationName: "Casa d'Aragona, Carrer de Císcar, 12, 46005 Valencia",
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-08-15T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 19. Celebración de 9 Meses en La Salvaora (15 Nov 2025)
  {
    id: 'cev-la-salvaora-9meses',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-11-15',
    time: '21:30',
    actualStartAt: '2025-11-15T21:30:00',
    ownerView: {
      title: '🎉 Celebración de 9 Meses Juntos · La Salvaora',
      subtitle: '15 de Noviembre de 2025 · Carrer de Calatrava, 19 · 9 meses de felicidad.',
      locationName: 'Restaurante La Salvaora, Carrer de Calatrava, 19, 46001 Valencia',
    },
    partnerView: {
      title: '🎉 Celebración de 9 Meses Juntos · La Salvaora',
      subtitle: '15 de Noviembre de 2025 · Carrer de Calatrava, 19 · 9 meses de felicidad.',
      locationName: 'Restaurante La Salvaora, Carrer de Calatrava, 19, 46001 Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-11-15T10:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 20. Cumpleaños de Andrea (1 de Septiembre)
  {
    id: 'cev-birthday-andrea-2025',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user2.id,
    partnerId: DEV_USERS.user1.id,
    eventType: 'important_date',
    date: '2025-09-01',
    time: '00:00',
    actualStartAt: '2025-09-01T00:00:00',
    ownerView: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · El día más bonito del año para celebrar la vida de Andrea.',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · El día más bonito del año para celebrar la vida de Andrea.',
      locationName: 'Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-09-01T00:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },
  {
    id: 'cev-birthday-andrea-2026',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user2.id,
    partnerId: DEV_USERS.user1.id,
    eventType: 'important_date',
    date: '2026-09-01',
    time: '00:00',
    actualStartAt: '2026-09-01T00:00:00',
    ownerView: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · ¡Celebrando la vida y el cumpleaños de Andrea juntos!',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · ¡Celebrando la vida y el cumpleaños de Andrea juntos!',
      locationName: 'Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'scheduled',
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 21. Cumpleaños de Tonet (19 de Octubre)
  {
    id: 'cev-birthday-tonet-2025',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2025-10-19',
    time: '00:00',
    actualStartAt: '2025-10-19T00:00:00',
    ownerView: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · Celebrando el cumpleaños de Tonet juntos con amor y risas.',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · Celebrando el cumpleaños de Tonet juntos con amor y risas.',
      locationName: 'Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-10-19T00:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },
  {
    id: 'cev-birthday-tonet-2026',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2026-10-19',
    time: '00:00',
    actualStartAt: '2026-10-19T00:00:00',
    ownerView: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · ¡Celebrando un año más juntos llenos de ilusión y proyectos!',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · ¡Celebrando un año más juntos llenos de ilusión y proyectos!',
      locationName: 'Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'scheduled',
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },
];

export const SAMPLE_AYA_QUESTIONS: AyaQuestionPrompt[] = [
  {
    id: 'aya-q1',
    question: '¿Cuál es un recuerdo de nosotros dos que siempre te hace sonreír cuando estás teniendo un mal día?',
    category: 'intimidad',
    target: 'pareja',
    deepLevel: 'suave'
  },
  {
    id: 'aya-q2',
    question: '¿Qué pequeña cosa hago en el día a día que te hace sentir más querida/o?',
    category: 'gratitud',
    target: 'pareja',
    deepLevel: 'suave'
  },
  {
    id: 'aya-q3',
    question: 'Si tuviéramos un mes entero libre sin responsabilidades en cualquier lugar del mundo, ¿a dónde iríamos y qué haríamos?',
    category: 'futuro',
    target: 'pareja',
    deepLevel: 'juego'
  },
  {
    id: 'aya-q4',
    question: '¿Hay algo sobre ti o sobre tus sueños para este año que aún no me hayas contado del todo?',
    category: 'vulnerabilidad',
    target: 'personal',
    deepLevel: 'profunda'
  }
];

export interface AddCoupleEventPayload {
  title: string;
  subtitle?: string;
  date: string;
  time?: string;
  location?: string;
  eventType: CoupleEventType;
  surpriseCategory?: 'cena' | 'regalo' | 'flores' | 'escapada' | 'plan_juntos' | 'carta' | 'especial';
  partnerTeaserTitle?: string;
  partnerTeaserSubtitle?: string;
  revealPolicy?: RevealPolicy;
  revealAt?: string;
  visibility?: 'shared' | 'private_until_reveal';
  notes?: string[];
}

export interface DevContextType {
  activeRole: 'user1' | 'user2';
  currentDevUser: DevUser;
  partnerDevUser: DevUser;
  users: { user1: DevUser; user2: DevUser };
  updateUserProfile: (userId: string, updates: Partial<DevUser>) => Promise<void>;
  isPremium: boolean;
  user1Consent: boolean;
  user2Consent: boolean;

  // 5 Core Connected Entities
  wishes: WishlistItem[];
  savedPlaces: Place[];
  places: MapPlace[]; // MapPlace[] for map
  mapPlaces: MapPlace[];
  coupleEvents: CoupleEvent[];
  ritualSeeds: RitualSeed[];
  weeklySummary: WeeklyRitualSummary;
  entries: DiaryEntryUI[];
  surprises: DiaryEntryUI[];
  ayaInsights: { id: string; title: string; description: string; date: string }[];

  // Actions
  switchRole: (role: 'user1' | 'user2') => void;
  togglePremium: () => void;
  toggleUser1Consent: () => void;
  toggleUser2Consent: () => void;

  // Cloud Sync & Realtime
  isCloudConnected: boolean;
  cloudSyncStatus: string;
  forceCloudSync: () => Promise<void>;
  uploadMediaImage: (fileBase64OrUri: string, fileName: string) => Promise<string>;

  // Wishbook Actions
  addWish: (wish: Partial<WishlistItem>) => void;
  updateWishStatus: (id: string, newStatus: WishlistStatus) => void;
  convertWishToSurprise: (wishId: string, surpriseNotes?: string) => void;
  convertWishToMemory: (wishId: string, story: string, photoUrl?: string) => void;
  deleteWish: (id: string) => void;

  // Places / Restaurant Actions
  addSavedPlace: (place: Partial<Place>) => void;
  updatePlaceStatus: (id: string, status: Place['status']) => void;
  convertPlaceToEvent: (placeId: string, date: string, time?: string) => void;

  // Calendar / Event Actions
  addCoupleEvent: (payload: AddCoupleEventPayload) => void;
  revealCoupleEvent: (id: string) => void;
  completeCoupleEvent: (id: string) => void;

  // Ritual Seeds Actions
  addRitualSeed: (seed: Partial<RitualSeed>) => void;

  // Map & Diary Actions
  addPlace: (place: Partial<MapPlace>) => void;
  addMapPlace: (place: Partial<MapPlace>) => void;
  addEntry: (entry: Partial<DiaryEntryUI>) => void;
  addSurprise: (surprise: Partial<DiaryEntryUI>) => void;
  updateSurpriseStatus: (id: string, newStatus: 'idea' | 'comprando' | 'listo' | 'entregado') => void;
  recordSurprisePurchase: (
    surpriseId: string,
    purchaseData: {
      purchasedAt: string;
      purchasePhotoUrl?: string;
      purchaseNotes?: string;
      productUrl?: string;
      price?: number;
      linkedWishId?: string;
    }
  ) => void;
  recordSurpriseDelivery: (
    surpriseId: string,
    deliveryData: {
      deliveredAt: string;
      deliveredPhotoUrl?: string;
      partnerReaction?: string;
      linkedWishId?: string;
    }
  ) => void;

  // Aya AI Actions
  getRandomAyaQuestion: () => AyaQuestionPrompt;

  // Auth state
  isLoaded: boolean;
  isAuthenticated: boolean;
  currentEmail: string | null;
  loginWithEmail: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Theme Palette state
  themePalette: 'atelier' | 'velvet' | 'lavender' | 'olive' | 'bordeaux';
  setThemePalette: (theme: 'atelier' | 'velvet' | 'lavender' | 'olive' | 'bordeaux') => Promise<void>;

  // Storage & Demo Mode Actions
  isDemoModeEnabled: boolean;
  resetAllDataToDefaults: () => Promise<void>;
  clearAllUserData: () => Promise<void>;
  exportAllUserData: () => Promise<string>;
  importAllUserData: (jsonString: string) => Promise<{ success: boolean; importedKeys: number; error?: string }>;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<'user1' | 'user2'>('user2'); // Default to Andrea
  const [users, setUsers] = useState<{ user1: DevUser; user2: DevUser }>(DEV_USERS);
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [user1Consent, setUser1Consent] = useState<boolean>(true);
  const [user2Consent, setUser2Consent] = useState<boolean>(true);

  const [themePalette, setThemePaletteState] = useState<'atelier' | 'velvet' | 'lavender' | 'olive' | 'bordeaux'>('atelier');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const [wishes, setWishes] = useState<WishlistItem[]>(INITIAL_WISHES);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>(INITIAL_SAVED_PLACES);
  const [mapPlaces, setMapPlaces] = useState<MapPlace[]>(SAMPLE_MAP_PLACES);
  const [coupleEvents, setCoupleEvents] = useState<CoupleEvent[]>(INITIAL_COUPLE_EVENTS);
  const [ritualSeeds, setRitualSeeds] = useState<RitualSeed[]>(INITIAL_RITUAL_SEEDS);
  const [entries, setEntries] = useState<DiaryEntryUI[]>(INITIAL_ENTRIES);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(CloudSyncEngine.getIsConnected());
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string>(CloudSyncEngine.getStatusText());

  // Realtime Cloud Sync Subscription
  useEffect(() => {
    CloudSyncEngine.initializeRealtime();

    const unsubscribe = CloudSyncEngine.subscribe({
      onEntityChange: (entity, eventType, record) => {
        if (!record) return;
        if (entity === 'wishes') {
          if (eventType === 'DELETE') {
            setWishes((prev) => prev.filter((w) => w.id !== record.id));
          } else {
            setWishes((prev) => {
              const exists = prev.some((w) => w.id === record.id);
              if (exists) return prev.map((w) => (w.id === record.id ? { ...w, ...record } : w));
              return [record, ...prev];
            });
          }
        } else if (entity === 'saved_places') {
          if (eventType === 'DELETE') {
            setSavedPlaces((prev) => prev.filter((p) => p.id !== record.id));
          } else {
            setSavedPlaces((prev) => {
              const exists = prev.some((p) => p.id === record.id);
              if (exists) return prev.map((p) => (p.id === record.id ? { ...p, ...record } : p));
              return [record, ...prev];
            });
          }
        } else if (entity === 'map_places') {
          if (eventType === 'DELETE') {
            setMapPlaces((prev) => prev.filter((p) => p.id !== record.id));
          } else {
            setMapPlaces((prev) => {
              const exists = prev.some((p) => p.id === record.id);
              if (exists) return prev.map((p) => (p.id === record.id ? { ...p, ...record } : p));
              return [record, ...prev];
            });
          }
        } else if (entity === 'couple_events') {
          if (eventType === 'DELETE') {
            setCoupleEvents((prev) => prev.filter((e) => e.id !== record.id));
          } else {
            setCoupleEvents((prev) => {
              const exists = prev.some((e) => e.id === record.id);
              if (exists) return prev.map((e) => (e.id === record.id ? { ...e, ...record } : e));
              return [record, ...prev];
            });
          }
        } else if (entity === 'profiles') {
          if (record) {
            const role = record.role_key || record.roleKey || (record.name?.toLowerCase().includes('tonet') ? 'user1' : 'user2');
            const isUser1 = role === 'user1' || record.id === DEV_USERS.user1.id;
            const photo = record.avatarPhoto || record.avatar_photo;
            const name = record.name;
            const avatar = record.avatar || (name ? name[0].toUpperCase() : undefined);
            const desc = record.roleDescription || record.role_description;

            setUsers((prev) => {
              const updated = {
                user1: isUser1 ? {
                  ...prev.user1,
                  ...(name ? { name } : {}),
                  ...(avatar ? { avatar } : {}),
                  ...(photo !== undefined ? { avatarPhoto: photo } : {}),
                  ...(desc ? { roleDescription: desc } : {}),
                } : prev.user1,
                user2: !isUser1 ? {
                  ...prev.user2,
                  ...(name ? { name } : {}),
                  ...(avatar ? { avatar } : {}),
                  ...(photo !== undefined ? { avatarPhoto: photo } : {}),
                  ...(desc ? { roleDescription: desc } : {}),
                } : prev.user2,
              };
              StorageEngine.setItem('andrea_users_v5', updated);
              return updated;
            });
          }
        } else if (entity === 'ritual_seeds') {
          setRitualSeeds((prev) => {
            const exists = prev.some((s) => s.id === record.id);
            if (exists) return prev.map((s) => (s.id === record.id ? { ...s, ...record } : s));
            return [record, ...prev];
          });
        }
      },
      onConnectionChange: (connected, status) => {
        setIsCloudConnected(connected);
        setCloudSyncStatus(status);
      },
    });

    return () => unsubscribe();
  }, []);

  // 1. Initial load from persistent storage + cloud hydration
  useEffect(() => {
    async function loadStoredData() {
      try {
        // 1. Purge legacy sessions to force fresh login on all devices
        StorageEngine.setItem('andrea_auth_session_v5', null);
        StorageEngine.setItem('andrea_auth_session_v6', null);

        const [
          savedRole,
          savedWishes,
          savedPlacesData,
          savedEvents,
          savedSeeds,
          savedEntries,
          savedUsers,
          savedAuth,
          savedTheme,
        ] = await Promise.all([
          StorageEngine.getItem<'user1' | 'user2'>(STORAGE_KEYS.ACTIVE_USER, 'user2'),
          StorageEngine.getItem<WishlistItem[] | null>(STORAGE_KEYS.WISHES, null),
          StorageEngine.getItem<Place[] | null>(STORAGE_KEYS.PLACES, null),
          StorageEngine.getItem<CoupleEvent[] | null>(STORAGE_KEYS.EVENTS, null),
          StorageEngine.getItem<RitualSeed[] | null>(STORAGE_KEYS.SEEDS, null),
          StorageEngine.getItem<DiaryEntryUI[] | null>('andrea_entries_v5', null),
          StorageEngine.getItem<{ user1: DevUser; user2: DevUser } | null>('andrea_users_v5', null),
          StorageEngine.getItem<{ email: string; role: 'user1' | 'user2'; timestamp?: number } | null>(AUTH_SESSION_KEY, null),
          StorageEngine.getItem<'atelier' | 'velvet' | 'lavender' | 'olive' | 'bordeaux' | null>('andrea_theme_palette_v5', null),
        ]);

        if (savedTheme) {
          setThemePaletteState(savedTheme);
        }

        // Validate 24-hour expiration window
        if (savedAuth && savedAuth.email && savedAuth.timestamp) {
          const elapsed = Date.now() - savedAuth.timestamp;
          if (elapsed < SESSION_MAX_AGE_MS) {
            setIsAuthenticated(true);
            setCurrentEmail(savedAuth.email);
            if (savedAuth.role) setActiveRole(savedAuth.role);
          } else {
            console.log('[DevContext] Session expired (>24h). Auto-logging out.');
            await StorageEngine.setItem(AUTH_SESSION_KEY, null);
            setIsAuthenticated(false);
            setCurrentEmail(null);
          }
        } else {
          setIsAuthenticated(false);
          setCurrentEmail(null);
        }

        if (savedWishes !== null && Array.isArray(savedWishes)) setWishes(savedWishes);
        if (savedPlacesData !== null && Array.isArray(savedPlacesData)) setSavedPlaces(savedPlacesData);
        if (savedEvents !== null && Array.isArray(savedEvents)) setCoupleEvents(savedEvents);
        if (savedSeeds !== null && Array.isArray(savedSeeds)) setRitualSeeds(savedSeeds);
        if (savedEntries !== null && Array.isArray(savedEntries)) setEntries(savedEntries);
        if (savedUsers && (savedUsers.user1 || savedUsers.user2)) {
          setUsers((prev) => ({
            user1: { ...prev.user1, ...(savedUsers.user1 || {}) },
            user2: { ...prev.user2, ...(savedUsers.user2 || {}) },
          }));
        }
      } catch (e) {
        console.warn('Error loading persisted data:', e);
      } finally {
        // INSTANTLY UNBLOCK UI: Renders LoginScreen or HomeScreen in <2ms with ZERO SPINNER HANG
        setIsLoaded(true);
      }

      // 2. Fetch remote state from Supabase Cloud in the background without blocking the UI
      if (CloudSyncEngine.isSupabaseConfigured()) {
        try {
          const cloudState = await CloudSyncEngine.fetchFullCloudState();
          if (cloudState) {
            if (cloudState.users) {
              setUsers((prev) => {
                const merged = {
                  user1: { ...prev.user1, ...(cloudState.users.user1 || {}) },
                  user2: { ...prev.user2, ...(cloudState.users.user2 || {}) },
                };
                try {
                  StorageEngine.setItem('andrea_users_v5', merged);
                } catch {
                  // ignore
                }
                return merged;
              });
            }
            if (cloudState.wishes && cloudState.wishes.length > 0) setWishes(cloudState.wishes);
            if (cloudState.savedPlaces && cloudState.savedPlaces.length > 0) setSavedPlaces(cloudState.savedPlaces);
            if (cloudState.mapPlaces && cloudState.mapPlaces.length > 0) setMapPlaces(cloudState.mapPlaces);
            if (cloudState.coupleEvents && cloudState.coupleEvents.length > 0) setCoupleEvents(cloudState.coupleEvents);
            if (cloudState.ritualSeeds && cloudState.ritualSeeds.length > 0) setRitualSeeds(cloudState.ritualSeeds);
          }
        } catch (cloudErr) {
          console.warn('[DevContext] Background Cloud hydration error:', cloudErr);
        }
      }
    }

    loadStoredData();
  }, []);

  // 24-hour periodic session expiration check
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isAuthenticated) {
        const session = await StorageEngine.getItem<{ email: string; role: 'user1' | 'user2'; timestamp?: number } | null>(AUTH_SESSION_KEY, null);
        if (session && session.timestamp) {
          const elapsed = Date.now() - session.timestamp;
          if (elapsed >= SESSION_MAX_AGE_MS) {
            console.log('[DevContext] Active session reached 24 hours. Logging out.');
            await logout();
          }
        }
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const updateUserProfile = async (userId: string, updates: Partial<DevUser>) => {
    const isUser1 = userId === DEV_USERS.user1.id || (updates.name && updates.name.toLowerCase().includes('tonet'));
    const roleKey: 'user1' | 'user2' = isUser1 ? 'user1' : 'user2';
    const targetUserId = isUser1 ? DEV_USERS.user1.id : DEV_USERS.user2.id;

    let finalPhoto = updates.avatarPhoto;
    if (
      finalPhoto &&
      (finalPhoto.startsWith('data:') ||
        finalPhoto.startsWith('blob:') ||
        finalPhoto.startsWith('file:') ||
        finalPhoto.startsWith('content:') ||
        finalPhoto.startsWith('ph:'))
    ) {
      try {
        finalPhoto = await CloudSyncEngine.uploadMediaImage(finalPhoto, `avatar_${roleKey}_${Date.now()}.jpg`);
      } catch (e) {
        console.warn('[DevContext] Upload avatar error:', e);
      }
    }

    const currentUser = isUser1 ? users.user1 : users.user2;
    const updatedUser: DevUser = {
      ...currentUser,
      ...updates,
      avatarPhoto: finalPhoto !== undefined ? finalPhoto : currentUser.avatarPhoto,
      id: targetUserId,
      avatar: updates.name ? updates.name[0].toUpperCase() : currentUser.avatar,
    };

    const nextUsers = {
      user1: isUser1 ? updatedUser : users.user1,
      user2: !isUser1 ? updatedUser : users.user2,
    };

    setUsers(nextUsers);
    await StorageEngine.setItem('andrea_users_v5', nextUsers);
    await CloudSyncEngine.syncUserProfile(targetUserId, roleKey, updatedUser);
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    const isTonet = cleanEmail === 'hwrtseo@gmail.com' || cleanEmail.includes('tonet') || cleanEmail.includes('hwrtseo');
    const role: 'user1' | 'user2' = isTonet ? 'user1' : 'user2';

    setActiveRole(role);
    setCurrentEmail(cleanEmail);
    setIsAuthenticated(true);

    try {
      await StorageEngine.setItem(AUTH_SESSION_KEY, {
        email: cleanEmail,
        role,
        timestamp: Date.now(),
      });
      await StorageEngine.setItem(STORAGE_KEYS.ACTIVE_USER, role);
    } catch (err) {
      console.warn('[DevContext] Storage write error on login:', err);
    }

    if (CloudSyncEngine.isSupabaseConfigured()) {
      CloudSyncEngine.fetchFullCloudState().then((cloudState) => {
        if (cloudState) {
          if (cloudState.users) {
            setUsers((prev) => {
              const merged = {
                user1: { ...prev.user1, ...(cloudState.users.user1 || {}) },
                user2: { ...prev.user2, ...(cloudState.users.user2 || {}) },
              };
              StorageEngine.setItem('andrea_users_v5', merged);
              return merged;
            });
          }
          if (cloudState.wishes && cloudState.wishes.length > 0) setWishes(cloudState.wishes);
          if (cloudState.savedPlaces && cloudState.savedPlaces.length > 0) setSavedPlaces(cloudState.savedPlaces);
          if (cloudState.mapPlaces && cloudState.mapPlaces.length > 0) setMapPlaces(cloudState.mapPlaces);
          if (cloudState.coupleEvents && cloudState.coupleEvents.length > 0) setCoupleEvents(cloudState.coupleEvents);
            if (cloudState.ritualSeeds && cloudState.ritualSeeds.length > 0) setRitualSeeds(cloudState.ritualSeeds);
        }
      }).catch((e) => console.warn('[DevContext] Cloud sync on login error:', e));
    }

    return true;
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setCurrentEmail(null);
    await StorageEngine.setItem(AUTH_SESSION_KEY, null);
    await StorageEngine.setItem('andrea_auth_session_v5', null);
    await StorageEngine.setItem('andrea_auth_session_v6', null);
  };

  const setThemePalette = async (newTheme: 'atelier' | 'velvet' | 'lavender' | 'olive' | 'bordeaux') => {
    setThemePaletteState(newTheme);
    await StorageEngine.setItem('andrea_theme_palette_v5', newTheme);
  };

  // 2. Auto-save watchers
  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem(STORAGE_KEYS.ACTIVE_USER, activeRole);
  }, [activeRole, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem(STORAGE_KEYS.WISHES, wishes);
  }, [wishes, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem(STORAGE_KEYS.PLACES, savedPlaces);
  }, [savedPlaces, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem(STORAGE_KEYS.EVENTS, coupleEvents);
  }, [coupleEvents, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem(STORAGE_KEYS.SEEDS, ritualSeeds);
  }, [ritualSeeds, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem('andrea_entries_v5', entries);
  }, [entries, isLoaded]);

  const currentDevUser = activeRole === 'user1' ? users.user1 : users.user2;
  const partnerDevUser = activeRole === 'user1' ? users.user2 : users.user1;

  const weeklySummary: WeeklyRitualSummary = {
    weekStartDate: '2026-08-24',
    totalMomentsSeeded: ritualSeeds.length + wishes.length,
    gentleMessage: `Esta semana habéis guardado vuestros rincones y recuerdos en vuestro espacio compartido.`,
    highlights: [
      'Tonet & Andrea han guardado momentos únicos',
      'Planes de citas y restaurantes en Valencia',
      'Vuestro atlas y recuerdos vivos listos para crecer'
    ]
  };

  const switchRole = (role: 'user1' | 'user2') => {
    setActiveRole(role);
  };

  const togglePremium = () => setIsPremium((prev) => !prev);
  const toggleUser1Consent = () => setUser1Consent((prev) => !prev);
  const toggleUser2Consent = () => setUser2Consent((prev) => !prev);

  // ── Wishbook Actions ──
  const addWish = async (wish: Partial<WishlistItem>) => {
    let finalExternalImage = wish.externalImageUrl;
    if (finalExternalImage && (finalExternalImage.startsWith('data:') || finalExternalImage.startsWith('blob:'))) {
      try {
        finalExternalImage = await CloudSyncEngine.uploadMediaImage(finalExternalImage, `wish_${Date.now()}.jpg`);
      } catch (e) {
        console.warn('[DevContext] Wish photo upload error:', e);
      }
    }

    const newId = 'wish-' + Date.now();
    const item: WishlistItem = {
      id: newId,
      coupleId: 'andrea-tonet',
      ownerUserId: currentDevUser.id,
      createdByUserId: currentDevUser.id,
      title: wish.title || 'Deseo sin título',
      description: wish.description,
      sourceUrl: wish.sourceUrl,
      externalImageUrl: finalExternalImage,
      images: wish.images && wish.images.length > 0 ? wish.images : (finalExternalImage ? [finalExternalImage] : []),
      type: wish.type || 'other',
      status: wish.status || 'dreaming',
      brand: wish.brand,
      estimatedPrice: wish.estimatedPrice,
      isForSelf: wish.isForSelf ?? true,
      phoneNumber: wish.phoneNumber,
      visibility: 'shared',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWishes((prev) => {
      const next = [item, ...prev];
      StorageEngine.setItem(STORAGE_KEYS.WISHES, next);
      return next;
    });
    await CloudSyncEngine.syncWish(item);
  };

  const updateWishStatus = (id: string, newStatus: WishlistStatus) => {
    setWishes((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, status: newStatus, updatedAt: new Date().toISOString() } : w));
      const target = next.find((w) => w.id === id);
      if (target) CloudSyncEngine.syncWish(target);
      return next;
    });
  };

  const convertWishToSurprise = (wishId: string, surpriseNotes?: string) => {
    const targetWish = wishes.find((w) => w.id === wishId);
    if (!targetWish) return;

    // 1. Mark wish as in_progress
    updateWishStatus(wishId, 'in_progress');

    // 2. Create stealth surprise diary entry
    const surpriseId = 'surp-' + Date.now();
    const entry: DiaryEntryUI = {
      id: surpriseId,
      coupleId: 'andrea-tonet',
      authorId: currentDevUser.id,
      type: 'surprise',
      visibility: 'private',
      date: new Date().toISOString().split('T')[0],
      content: {
        title: `Sorpresa: ${targetWish.title}`,
        description: surpriseNotes || `Preparando sorpresa para cumplir este deseo: ${targetWish.title}`,
        status: 'idea',
        occasion: 'sin_ocasión',
      },
      moodTag: 'love',
      ayaConsentBoth: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMine: true
    };

    setEntries((prev) => [entry, ...prev]);
  };

  const convertWishToMemory = (wishId: string, story: string, photoUrl?: string) => {
    const targetWish = wishes.find((w) => w.id === wishId);
    if (!targetWish) return;

    // 1. Mark wish as fulfilled
    updateWishStatus(wishId, 'fulfilled');

    // 2. Add as rich memory diary entry
    const memoryId = 'mem-' + Date.now();
    const entry: DiaryEntryUI = {
      id: memoryId,
      coupleId: 'andrea-tonet',
      authorId: currentDevUser.id,
      type: 'diary_shared',
      visibility: 'shared',
      date: new Date().toISOString().split('T')[0],
      content: {
        title: `✨ Cumplido: ${targetWish.title}`,
        story: story || `Hicimos realidad este deseo juntos. Un momento inolvidable.`,
        body: story || `Hicimos realidad este deseo juntos.`,
        photos: photoUrl ? [photoUrl] : (targetWish.externalImageUrl ? [targetWish.externalImageUrl] : [])
      },
      moodTag: 'grateful',
      ayaConsentBoth: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMine: true
    };

    setEntries((prev) => [entry, ...prev]);
  };

  const deleteWish = (id: string) => {
    setWishes((prev) => prev.filter((w) => w.id !== id));
    CloudSyncEngine.deleteWish(id);
  };

  // ── Place / Restaurant Actions ──
  const addSavedPlace = (place: Partial<Place>) => {
    const newId = 'place-' + Date.now();
    const newPlace: Place = {
      id: newId,
      coupleId: 'andrea-tonet',
      createdByUserId: currentDevUser.id,
      name: place.name || 'Lugar sin nombre',
      category: place.category || 'restaurant',
      status: place.status || 'want_to_go',
      address: place.address || 'Ubicación guardada',
      city: place.city || 'Valencia',
      country: place.country || 'España',
      countryCode: place.countryCode || 'ES',
      phoneNumber: place.phoneNumber,
      latitude: place.latitude || 39.4699,
      longitude: place.longitude || -0.3763,
      cuisine: place.cuisine || ['Gastronomía'],
      priceLevel: place.priceLevel || 2,
      vibe: place.vibe || 'romantico',
      tags: place.tags || ['guardado_reciente'],
      ratingPersonal: place.ratingPersonal,
      note: place.note,
      coverImageUrl: place.coverImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSavedPlaces((prev) => [newPlace, ...prev]);
    CloudSyncEngine.syncSavedPlace(newPlace);
  };

  const updatePlaceStatus = (id: string, status: Place['status']) => {
    setSavedPlaces((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p));
      const target = next.find((p) => p.id === id);
      if (target) CloudSyncEngine.syncSavedPlace(target);
      return next;
    });
  };

  const convertPlaceToEvent = (placeId: string, date: string, time?: string) => {
    const place = savedPlaces.find((p) => p.id === placeId);
    if (!place) return;

    const newEvent: CoupleEvent = {
      id: 'cev-' + Date.now(),
      coupleId: 'andrea-tonet',
      ownerId: currentDevUser.id,
      partnerId: partnerDevUser.id,
      eventType: 'date',
      date: date || '2026-09-05',
      time: time || '21:00',
      actualStartAt: `${date || '2026-09-05'}T${time || '21:00'}:00`,
      ownerView: {
        title: `Cena en ${place.name}`,
        subtitle: `${place.city} · ${place.cuisine?.join(', ')}`,
        locationName: place.address || place.name,
        notes: [place.note || '¡Ganas de probarlo juntos!']
      },
      partnerView: {
        title: `Cena en ${place.name}`,
        subtitle: `${place.city} · ${place.cuisine?.join(', ')}`,
        locationName: place.address || place.name,
      },
      revealPolicy: 'immediate',
      visibility: 'shared',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCoupleEvents((prev) => [newEvent, ...prev]);
    CloudSyncEngine.syncCoupleEvent(newEvent);
    setSavedPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, status: 'planned' } : p))
    );
  };

  // ── Event Actions ──
  const addCoupleEvent = (payload: AddCoupleEventPayload) => {
    const newId = 'cev-' + Date.now();
    const isSurprise = payload.eventType === 'surprise';

    const event: CoupleEvent = {
      id: newId,
      coupleId: 'andrea-tonet',
      ownerId: currentDevUser.id,
      partnerId: partnerDevUser.id,
      eventType: payload.eventType,
      date: payload.date,
      time: payload.time,
      actualStartAt: `${payload.date}T${payload.time || '20:00'}:00`,
      ownerView: {
        title: payload.title,
        subtitle: payload.subtitle,
        locationName: payload.location,
        notes: payload.notes,
      },
      partnerView: {
        title: isSurprise ? (payload.partnerTeaserTitle || '✨ Tienes un plan especial') : payload.title,
        subtitle: isSurprise ? (payload.partnerTeaserSubtitle || 'Prepárate para un momento bonito juntos.') : payload.subtitle,
        locationName: isSurprise ? undefined : payload.location,
        isSecret: isSurprise,
      },
      surpriseCategory: payload.surpriseCategory,
      revealPolicy: payload.revealPolicy || (isSurprise ? 'scheduled' : 'immediate'),
      revealAt: payload.revealAt,
      visibility: payload.visibility || (isSurprise ? 'private_until_reveal' : 'shared'),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCoupleEvents((prev) => [event, ...prev]);
    CloudSyncEngine.syncCoupleEvent(event);
  };

  const revealCoupleEvent = (id: string) => {
    setCoupleEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, status: 'revealed' as const } : ev))
    );
  };

  const completeCoupleEvent = (id: string) => {
    setCoupleEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, status: 'completed' as const } : ev))
    );
  };

  // ── Ritual Seeds Actions ──
  const addRitualSeed = async (seed: Partial<RitualSeed>) => {
    let finalPhoto = seed.photoUrl || seed.imageUrl;
    if (finalPhoto && (finalPhoto.startsWith('data:') || finalPhoto.startsWith('blob:'))) {
      try {
        finalPhoto = await CloudSyncEngine.uploadMediaImage(finalPhoto, `ritual_${Date.now()}.jpg`);
      } catch (e) {
        console.warn('[DevContext] Ritual photo upload error:', e);
      }
    }

    const newSeed: RitualSeed = {
      id: 'seed-' + Date.now(),
      coupleId: 'andrea-tonet',
      authorId: currentDevUser.id,
      date: seed.date || new Date().toISOString().split('T')[0],
      type: seed.type || 'gratitude_note',
      title: seed.title || 'Momento compartido',
      body: seed.body || '',
      imageUrl: finalPhoto,
      photoUrl: finalPhoto,
      mood: seed.mood || 'grateful',
      isSharedWithPartner: true,
      partnerResponded: false,
      createdAt: new Date().toISOString(),
    };

    setRitualSeeds((prev) => [newSeed, ...prev]);
    await CloudSyncEngine.syncRitualSeed(newSeed);
  };

  // ── Map & Diary Actions ──
  const addMapPlace = (place: Partial<MapPlace>) => {
    const newPlace: MapPlace = {
      id: 'place-' + Date.now(),
      title: place.title || 'Lugar Especial',
      cityName: place.cityName || 'Valencia',
      country: place.country || 'España',
      countryCode: place.countryCode || 'ES',
      lat: place.lat || 39.4699,
      lng: place.lng || -0.3763,
      date: place.date || new Date().toISOString().split('T')[0],
      story: place.story || 'Un recuerdo imborrable juntos.',
      category: place.category || 'cita',
      moodTag: place.moodTag || 'love',
      photos: place.photos || [],
      authorId: currentDevUser.id,
      locationPrecision: 'exact',
      visibility: 'couple',
      isMilestone: true,
    };

    setMapPlaces((prev) => [newPlace, ...prev]);
    CloudSyncEngine.syncMapPlace(newPlace);
  };

  const addEntry = (entry: Partial<DiaryEntryUI>) => {
    const newEntry: DiaryEntryUI = {
      id: 'entry-' + Date.now(),
      coupleId: 'andrea-tonet',
      authorId: currentDevUser.id,
      type: entry.type || 'diary_shared',
      visibility: entry.visibility || 'shared',
      date: entry.date || new Date().toISOString().split('T')[0],
      content: entry.content || { title: 'Nuevo Recuerdo', body: '' },
      moodTag: entry.moodTag || 'calm',
      ayaConsentBoth: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMine: true
    };

    setEntries((prev) => [newEntry, ...prev]);
  };

  const addSurprise = (surprise: Partial<DiaryEntryUI>) => {
    const content = surprise.content as any;
    const newSurprise: DiaryEntryUI = {
      id: 'surp-' + Date.now(),
      coupleId: 'andrea-tonet',
      authorId: currentDevUser.id,
      type: 'surprise',
      visibility: 'private',
      date: surprise.date || new Date().toISOString().split('T')[0],
      content: {
        title: content?.title || 'Sorpresa en marcha',
        description: content?.description || '',
        status: 'idea',
        occasion: 'sin_ocasión',
      },
      moodTag: 'love',
      ayaConsentBoth: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMine: true
    };

    setEntries((prev) => [newSurprise, ...prev]);
  };

  const updateSurpriseStatus = (id: string, newStatus: 'idea' | 'comprando' | 'listo' | 'entregado') => {
    setEntries((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const content = s.content as any;
          return {
            ...s,
            content: {
              ...content,
              status: newStatus
            }
          };
        }
        return s;
      })
    );
  };

  const recordSurprisePurchase = (
    surpriseId: string,
    purchaseData: {
      purchasedAt: string;
      purchasePhotoUrl?: string;
      purchaseNotes?: string;
      productUrl?: string;
      price?: number;
      linkedWishId?: string;
    }
  ) => {
    // 1. Update entries / surprises
    setEntries((prev) =>
      prev.map((s) => {
        if (s.id === surpriseId) {
          const content = s.content as any;
          return {
            ...s,
            content: {
              ...content,
              status: 'comprando',
              purchaseDetails: {
                purchasedAt: purchaseData.purchasedAt,
                purchasedBy: currentDevUser.id,
                purchasePhotoUrl: purchaseData.purchasePhotoUrl,
                purchaseNotes: purchaseData.purchaseNotes,
                productUrl: purchaseData.productUrl,
                price: purchaseData.price,
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    // 2. If linked to a wish, set wish status to 'in_progress'
    if (purchaseData.linkedWishId) {
      updateWishStatus(purchaseData.linkedWishId, 'in_progress');
    } else {
      const targetSurprise = entries.find((e) => e.id === surpriseId);
      const title = (targetSurprise?.content as any)?.title || '';
      const matchingWish = wishes.find((w) => title.toLowerCase().includes(w.title.toLowerCase()));
      if (matchingWish) {
        updateWishStatus(matchingWish.id, 'in_progress');
      }
    }
  };

  const recordSurpriseDelivery = (
    surpriseId: string,
    deliveryData: {
      deliveredAt: string;
      deliveredPhotoUrl?: string;
      partnerReaction?: string;
      linkedWishId?: string;
    }
  ) => {
    let targetSurprise = entries.find((e) => e.id === surpriseId);

    // 1. Update entries / surprises
    setEntries((prev) =>
      prev.map((s) => {
        if (s.id === surpriseId) {
          const content = s.content as any;
          return {
            ...s,
            content: {
              ...content,
              status: 'entregado',
              deliveryDetails: {
                deliveredAt: deliveryData.deliveredAt,
                deliveredPhotoUrl: deliveryData.deliveredPhotoUrl,
                partnerReaction: deliveryData.partnerReaction,
                receivedBy: currentDevUser.id,
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    // 2. If linked to a wish, set wish status to 'fulfilled'
    let matchedWishId = deliveryData.linkedWishId;
    if (!matchedWishId && targetSurprise) {
      const title = (targetSurprise.content as any)?.title || '';
      const matchingWish = wishes.find((w) => title.toLowerCase().includes(w.title.toLowerCase()));
      if (matchingWish) matchedWishId = matchingWish.id;
    }
    if (matchedWishId) {
      updateWishStatus(matchedWishId, 'fulfilled');
    }

    // 3. Generate a shared memory in Nuestra Historia
    const title = (targetSurprise?.content as any)?.title || 'Sorpresa Hecha Realidad';
    const purchasePhoto = (targetSurprise?.content as any)?.purchaseDetails?.purchasePhotoUrl;
    const deliveryPhoto = deliveryData.deliveredPhotoUrl;
    const photos = [deliveryPhoto, purchasePhoto].filter(Boolean) as string[];

    const memoryEntry: DiaryEntryUI = {
      id: 'mem-surp-' + Date.now(),
      coupleId: 'andrea-tonet',
      authorId: currentDevUser.id,
      type: 'diary_shared',
      visibility: 'shared',
      date: deliveryData.deliveredAt || new Date().toISOString().split('T')[0],
      content: {
        title: `✨ Hecho Realidad: ${title.replace(/^Sorpresa:\s*/i, '')}`,
        story: deliveryData.partnerReaction || `Un momento mágico hecho realidad juntos.`,
        body: deliveryData.partnerReaction || `Un momento mágico hecho realidad juntos.`,
        photos: photos,
      },
      moodTag: 'grateful',
      ayaConsentBoth: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMine: true,
    };

    setEntries((prev) => [memoryEntry, ...prev]);
  };

  const ayaInsights = [
    {
      id: 'ins-1',
      title: 'Espacios de calma compartida',
      description: 'Ambos valoráis especialmente los momentos tranquilos de lectura y café en casa.',
      date: '28 de agosto'
    },
    {
      id: 'ins-2',
      title: 'Pasión por la gastronomía italiana',
      description: 'Tanto Tonet como Andrea disfrutan descubriendo restaurantes italianos y rincones con encanto en Valencia.',
      date: '25 de agosto'
    }
  ];

  const isDemoModeEnabled = process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE === 'true';

  const resetAllDataToDefaults = async () => {
    await StorageEngine.setItem(STORAGE_KEYS.WISHES, INITIAL_WISHES);
    await StorageEngine.setItem(STORAGE_KEYS.PLACES, INITIAL_SAVED_PLACES);
    await StorageEngine.setItem(STORAGE_KEYS.EVENTS, INITIAL_COUPLE_EVENTS);
    await StorageEngine.setItem(STORAGE_KEYS.SEEDS, INITIAL_RITUAL_SEEDS);
    await StorageEngine.setItem('andrea_entries_v5', INITIAL_ENTRIES);
    setWishes(INITIAL_WISHES);
    setSavedPlaces(INITIAL_SAVED_PLACES);
    setCoupleEvents(INITIAL_COUPLE_EVENTS);
    setRitualSeeds(INITIAL_RITUAL_SEEDS);
    setEntries(INITIAL_ENTRIES);
  };

  const clearAllUserData = async () => {
    await StorageEngine.clearAllData();
    setWishes([]);
    setSavedPlaces([]);
    setCoupleEvents([]);
    setRitualSeeds([]);
    setEntries([]);
    setMapPlaces([]);
  };

  const exportAllUserData = async () => {
    return StorageEngine.exportAllLocalData();
  };

  const importAllUserData = async (jsonString: string) => {
    const res = await StorageEngine.importAllLocalData(jsonString);
    if (res.success) {
      const [w, p, e, s] = await Promise.all([
        StorageEngine.getItem<WishlistItem[]>(STORAGE_KEYS.WISHES, []),
        StorageEngine.getItem<Place[]>(STORAGE_KEYS.PLACES, []),
        StorageEngine.getItem<CoupleEvent[]>(STORAGE_KEYS.EVENTS, []),
        StorageEngine.getItem<RitualSeed[]>(STORAGE_KEYS.SEEDS, []),
      ]);
      setWishes(w);
      setSavedPlaces(p);
      setCoupleEvents(e);
      setRitualSeeds(s);
    }
    return res;
  };

  const getRandomAyaQuestion = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_AYA_QUESTIONS.length);
    return SAMPLE_AYA_QUESTIONS[randomIndex];
  };

  const forceCloudSync = async () => {
    await CloudSyncEngine.initializeRealtime();
  };

  const uploadMediaImage = async (fileBase64OrUri: string, fileName: string) => {
    return CloudSyncEngine.uploadMediaImage(fileBase64OrUri, fileName);
  };

  return (
    <DevContext.Provider
      value={{
        isLoaded,
        isAuthenticated,
        currentEmail,
        loginWithEmail,
        logout,
        themePalette,
        setThemePalette,
        activeRole,
        currentDevUser,
        partnerDevUser,
        users,
        updateUserProfile,
        isPremium,
        user1Consent,
        user2Consent,
        isCloudConnected,
        cloudSyncStatus,
        forceCloudSync,
        uploadMediaImage,
        wishes,
        savedPlaces,
        places: mapPlaces,
        mapPlaces,
        coupleEvents,
        ritualSeeds,
        weeklySummary,
        entries,
        surprises: entries.filter((e) => e.type === 'surprise'),
        ayaInsights,
        switchRole,
        togglePremium,
        toggleUser1Consent,
        toggleUser2Consent,
        addWish,
        updateWishStatus,
        convertWishToSurprise,
        convertWishToMemory,
        deleteWish,
        addSavedPlace,
        updatePlaceStatus,
        convertPlaceToEvent,
        addCoupleEvent,
        revealCoupleEvent,
        completeCoupleEvent,
        addRitualSeed,
        addPlace: addMapPlace,
        addMapPlace,
        addEntry,
        addSurprise,
        updateSurpriseStatus,
        recordSurprisePurchase,
        recordSurpriseDelivery,
        getRandomAyaQuestion,
        isDemoModeEnabled,
        resetAllDataToDefaults,
        clearAllUserData,
        exportAllUserData,
        importAllUserData,
      }}
    >
      {children}
    </DevContext.Provider>
  );
}

export function useDev() {
  const ctx = useContext(DevContext);
  if (!ctx) {
    throw new Error('useDev must be used within DevProvider');
  }
  return ctx;
}
