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

export interface DevUser {
  id: string;
  name: string;
  avatar: string;
  avatarPhoto?: string;
  roleDescription: string;
}

export const DEV_USERS: { user1: DevUser; user2: DevUser } = {
  user1: {
    id: '11111111-aaaa-bbbb-cccc-111111111111',
    name: 'Ángel',
    avatar: 'Á',
    avatarPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    roleDescription: 'Quien suele iniciar planes y documentar detalles'
  },
  user2: {
    id: '22222222-dddd-eeee-ffff-222222222222',
    name: 'Andrea',
    avatar: 'A',
    avatarPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    roleDescription: 'Quien da significado y aporta calidez espontánea'
  }
};

export const INITIAL_WISHES: WishlistItem[] = [
  {
    id: 'wish-1',
    coupleId: 'demo-couple-id',
    ownerUserId: DEV_USERS.user2.id,
    createdByUserId: DEV_USERS.user2.id,
    title: 'Bolso de hombro de piel café minimalista',
    description: 'En tono caramelo o chocolate con hebilla dorada sutil para diario.',
    type: 'fashion',
    status: 'dreaming', // Me hace ilusión
    visibility: 'shared',
    brand: 'Sézane / Massimo Dutti',
    sourceUrl: 'https://www.sezane.com',
    sourceDomain: 'sezane.com',
    externalImageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop',
    estimatedPrice: 135,
    currency: 'EUR',
    priceNote: 'Aprox. 120-150€',
    color: 'Caramelo / Café',
    desiredFor: 'Cumpleaños o regalo especial',
    occasion: 'cumpleaños',
    tags: ['moda', 'diario', 'elegante'],
    isForSelf: false,
    createdAt: '2026-08-15T14:20:00Z',
    updatedAt: '2026-08-15T14:20:00Z'
  },
  {
    id: 'wish-2',
    coupleId: 'demo-couple-id',
    ownerUserId: DEV_USERS.user2.id,
    createdByUserId: DEV_USERS.user2.id,
    title: 'Cena Omakase en Kibo Sushi Bar',
    description: 'Menú degustación del chef en barra japonesa íntima de 8 comensales.',
    type: 'restaurant',
    status: 'planned', // Para una ocasión especial
    visibility: 'shared',
    brand: 'Kibo Omakase',
    externalImageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop',
    estimatedPrice: 90,
    currency: 'EUR',
    priceNote: '90€ por persona',
    occasion: 'aniversario',
    tags: ['restaurante', 'japones', 'romantico', 'cita'],
    isForSelf: false,
    restaurantId: 'place-rest-1',
    createdAt: '2026-08-10T19:00:00Z',
    updatedAt: '2026-08-10T19:00:00Z'
  },
  {
    id: 'wish-3',
    coupleId: 'demo-couple-id',
    ownerUserId: DEV_USERS.user1.id,
    createdByUserId: DEV_USERS.user1.id,
    title: 'Zapatillas de ante beige estilo retro 70s',
    description: 'Ligeras, suela color caramelo, perfectas para caminar en viajes.',
    type: 'fashion',
    status: 'considering', // Lo estoy pensando
    visibility: 'shared',
    brand: 'Adidas Originals / Veja',
    externalImageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop',
    estimatedPrice: 110,
    currency: 'EUR',
    size: '42.5',
    color: 'Beige / Almendra',
    tags: ['zapatillas', 'calzado', 'viajes'],
    isForSelf: true,
    createdAt: '2026-08-18T11:30:00Z',
    updatedAt: '2026-08-18T11:30:00Z'
  },
  {
    id: 'wish-4',
    coupleId: 'demo-couple-id',
    ownerUserId: DEV_USERS.user2.id,
    createdByUserId: DEV_USERS.user2.id,
    title: 'Escapada a una cabaña con chimenea en Asturias',
    description: 'Dos días de desconexión entre montañas verdes, lluvia y manta.',
    type: 'trip',
    status: 'someday', // Algún día
    visibility: 'shared',
    externalImageUrl: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&auto=format&fit=crop',
    estimatedPrice: 220,
    currency: 'EUR',
    tags: ['viaje', 'escapada', 'naturaleza', 'asturias'],
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z'
  },
  {
    id: 'wish-5',
    coupleId: 'demo-couple-id',
    ownerUserId: DEV_USERS.user1.id,
    createdByUserId: DEV_USERS.user1.id,
    title: 'Juego de mesa cooperativo para dos (Pandemic / Unmatched)',
    description: 'Para tardes de domingo de lluvia con chocolate caliente.',
    type: 'home',
    status: 'dreaming',
    visibility: 'shared',
    externalImageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop',
    estimatedPrice: 35,
    currency: 'EUR',
    tags: ['casa', 'juegos', 'domingos'],
    createdAt: '2026-08-22T16:00:00Z',
    updatedAt: '2026-08-22T16:00:00Z'
  }
];

export const INITIAL_SAVED_PLACES: Place[] = [
  {
    id: 'place-rest-el-pou',
    coupleId: 'demo-couple-id',
    createdByUserId: DEV_USERS.user1.id,
    name: 'Restaurante El Pou',
    category: 'restaurant',
    status: 'visited', // Nuestra primera cita
    address: 'Carrer de Pere Aleixandre 42, cerca de la Ciudad de las Artes y las Ciencias',
    city: 'Valencia',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 963 34 56 78',
    latitude: 39.4580,
    longitude: -0.3540,
    cuisine: ['Mediterránea', 'Arroces', 'Cocina de Mercado'],
    priceLevel: 2,
    vibe: 'romantico',
    tags: ['primera_cita', 'especial', 'valencia', 'recuerdo_eterno'],
    ratingPersonal: 5,
    note: 'Nuestra primera cita oficial cerca de la Ciudad de las Artes y las Ciencias. Risas, complicidad y donde supimos que esto era especial.',
    coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
    createdAt: '2024-12-05T21:00:00Z',
    updatedAt: '2024-12-05T23:30:00Z'
  },
  {
    id: 'place-rest-1',
    coupleId: 'demo-couple-id',
    createdByUserId: DEV_USERS.user2.id,
    name: 'Kibo Omakase',
    category: 'restaurant',
    status: 'want_to_go', // Pendiente
    address: 'Calle de Claudio Coello 45',
    city: 'Madrid',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 914 35 12 89',
    latitude: 40.4285,
    longitude: -3.6872,
    cuisine: ['Japonesa', 'Sushi', 'Omakase'],
    priceLevel: 3,
    vibe: 'romantico',
    tags: ['para_cita_especial', 'alta_cocina', 'intimo'],
    ratingPersonal: 5,
    note: 'El sitio que Andrea guardó para nuestro próximo aniversario del 15 de Febrero. Barra de 8 comensales.',
    coverImageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop',
    linkedWishlistItemId: 'wish-2',
    createdAt: '2026-08-10T19:00:00Z',
    updatedAt: '2026-08-10T19:00:00Z'
  },
  {
    id: 'place-rest-2',
    coupleId: 'demo-couple-id',
    createdByUserId: DEV_USERS.user1.id,
    name: 'Trattoria Popolare',
    category: 'restaurant',
    status: 'visited', // Fuimos
    address: 'Piazza Navona 12',
    city: 'Roma',
    country: 'Italia',
    countryCode: 'IT',
    phoneNumber: '+39 06 6880 1234',
    latitude: 41.8992,
    longitude: 12.4731,
    cuisine: ['Italiana', 'Pasta Fresca', 'Tiramisú'],
    priceLevel: 2,
    vibe: 'romantico',
    tags: ['favorito', 'queremos_repetir', 'viaje_italia'],
    ratingPersonal: 5,
    note: 'La mejor pasta cacio e pepe que hemos probado nunca. Pedimos dos raciones de tiramisú.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
    createdAt: '2025-05-14T21:00:00Z',
    updatedAt: '2025-05-14T21:00:00Z'
  },
  {
    id: 'place-rest-3',
    coupleId: 'demo-couple-id',
    createdByUserId: DEV_USERS.user2.id,
    name: 'Café de Flore',
    category: 'cafe',
    status: 'favorite', // Favorito
    address: '172 Boulevard Saint-Germain',
    city: 'París',
    country: 'Francia',
    countryCode: 'FR',
    phoneNumber: '+33 1 45 48 55 26',
    latitude: 48.8543,
    longitude: 2.3328,
    cuisine: ['Café de Especialidad', 'Croissants', 'Bistró'],
    priceLevel: 2,
    vibe: 'tranquilo',
    tags: ['desayuno', 'con_encanto', 'paris'],
    ratingPersonal: 5,
    note: 'Desayuno bajo la lona verde viendo llover sobre París.',
    coverImageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop',
    createdAt: '2025-09-22T10:00:00Z',
    updatedAt: '2025-09-22T10:00:00Z'
  },
  {
    id: 'place-rest-4',
    coupleId: 'demo-couple-id',
    createdByUserId: DEV_USERS.user1.id,
    name: 'El Mirador del Carmen',
    category: 'restaurant',
    status: 'planned', // Planificado
    address: 'Paseo de los Tristes',
    city: 'Granada',
    country: 'España',
    countryCode: 'ES',
    phoneNumber: '+34 958 22 14 56',
    latitude: 37.1785,
    longitude: -3.5932,
    cuisine: ['Mediterránea', 'Tapas de autor', 'Vinos'],
    priceLevel: 2,
    vibe: 'vistas',
    tags: ['con_vistas', 'alhambra', 'terraza'],
    ratingPersonal: 4,
    note: 'Terraza con vistas directas a la Alhambra iluminada.',
    coverImageUrl: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&auto=format&fit=crop',
    createdAt: '2026-08-20T12:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z'
  }
];

export const INITIAL_RITUAL_SEEDS: RitualSeed[] = [
  {
    id: 'seed-1',
    coupleId: 'demo-couple-id',
    authorId: DEV_USERS.user2.id,
    date: '2026-08-29',
    type: 'gratitude_note',
    title: 'Agradecimiento de hoy',
    body: 'Me ha encantado cuando me has traído el café a la cama sin pedirlo.',
    mood: 'grateful',
    isSharedWithPartner: true,
    partnerResponded: true,
    createdAt: '2026-08-29T08:30:00Z'
  },
  {
    id: 'seed-2',
    coupleId: 'demo-couple-id',
    authorId: DEV_USERS.user1.id,
    date: '2026-08-28',
    type: 'question_answer',
    title: 'Pregunta de Andrea',
    body: '¿Qué es lo que más valoras de nuestros domingos juntos?',
    isSharedWithPartner: true,
    partnerResponded: true,
    createdAt: '2026-08-28T21:15:00Z'
  },
  {
    id: 'seed-3',
    coupleId: 'demo-couple-id',
    authorId: DEV_USERS.user2.id,
    date: '2026-08-27',
    type: 'daily_photo',
    title: 'Paseo al atardecer',
    body: 'El cielo de hoy parecía una acuarela.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
    isSharedWithPartner: true,
    createdAt: '2026-08-27T20:10:00Z'
  }
];

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
    story: "El 15 de febrero de 2025 en Pg. de l'Albereda, 44 (Camins al Grau, Valencia). El rincón mágico donde nos dimos nuestro primer beso y donde Ángel le pidió salir a Andrea. El comienzo oficial de nuestra historia de amor.",
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
    title: 'Casa de Ángel · Conde de Real',
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

export const INITIAL_ENTRIES: DiaryEntryUI[] = [
  {
    id: 'entry-1',
    coupleId: 'demo-couple-id',
    authorId: DEV_USERS.user1.id,
    type: 'diary_shared',
    visibility: 'shared',
    date: '2026-08-28',
    content: {
      title: 'Tarde de lluvia y café',
      body: 'Me ha encantado estar los dos leyendo en el salón mientras llovía fuera.'
    },
    moodTag: 'calm',
    ayaConsentBoth: true,
    createdAt: '2026-08-28T19:00:00Z',
    updatedAt: '2026-08-28T19:00:00Z',
    isMine: true
  }
];

export const INITIAL_COUPLE_EVENTS: CoupleEvent[] = [
  // 1. Donde nos conocimos (23 Nov 2024)
  {
    id: 'cev-first-met',
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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
    coupleId: 'demo-couple-id',
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

  // Aya AI Actions
  getRandomAyaQuestion: () => AyaQuestionPrompt;

  // Storage & Reset Actions
  resetAllDataToDefaults: () => Promise<void>;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<'user1' | 'user2'>('user2'); // Default to Andrea
  const [users, setUsers] = useState<{ user1: DevUser; user2: DevUser }>(DEV_USERS);
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [user1Consent, setUser1Consent] = useState<boolean>(true);
  const [user2Consent, setUser2Consent] = useState<boolean>(true);

  const [wishes, setWishes] = useState<WishlistItem[]>(INITIAL_WISHES);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>(INITIAL_SAVED_PLACES);
  const [mapPlaces, setMapPlaces] = useState<MapPlace[]>(SAMPLE_MAP_PLACES);
  const [coupleEvents, setCoupleEvents] = useState<CoupleEvent[]>(INITIAL_COUPLE_EVENTS);
  const [ritualSeeds, setRitualSeeds] = useState<RitualSeed[]>(INITIAL_RITUAL_SEEDS);
  const [entries, setEntries] = useState<DiaryEntryUI[]>(INITIAL_ENTRIES);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial load from persistent storage
  useEffect(() => {
    async function loadStoredData() {
      try {
        const [
          savedRole,
          savedWishes,
          savedPlacesData,
          savedEvents,
          savedSeeds,
          savedEntries,
          savedUsers,
        ] = await Promise.all([
          StorageEngine.getItem<'user1' | 'user2'>(STORAGE_KEYS.ACTIVE_USER, 'user2'),
          StorageEngine.getItem<WishlistItem[]>(STORAGE_KEYS.WISHES, INITIAL_WISHES),
          StorageEngine.getItem<Place[]>(STORAGE_KEYS.PLACES, INITIAL_SAVED_PLACES),
          StorageEngine.getItem<CoupleEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_COUPLE_EVENTS),
          StorageEngine.getItem<RitualSeed[]>(STORAGE_KEYS.SEEDS, INITIAL_RITUAL_SEEDS),
          StorageEngine.getItem<DiaryEntryUI[]>('andrea_entries_v1', INITIAL_ENTRIES),
          StorageEngine.getItem<{ user1: DevUser; user2: DevUser }>('andrea_users_v1', DEV_USERS),
        ]);

        if (savedRole) setActiveRole(savedRole);
        if (savedWishes && savedWishes.length > 0) setWishes(savedWishes);
        if (savedPlacesData && savedPlacesData.length > 0) setSavedPlaces(savedPlacesData);
        if (savedEvents && savedEvents.length > 0) setCoupleEvents(savedEvents);
        if (savedSeeds && savedSeeds.length > 0) setRitualSeeds(savedSeeds);
        if (savedEntries && savedEntries.length > 0) setEntries(savedEntries);
        if (savedUsers && (savedUsers.user1 || savedUsers.user2)) {
          setUsers((prev) => ({
            user1: { ...prev.user1, ...(savedUsers.user1 || {}) },
            user2: { ...prev.user2, ...(savedUsers.user2 || {}) },
          }));
        }
      } catch (e) {
        console.warn('Error loading persisted data:', e);
      } finally {
        setIsLoaded(true);
      }
    }

    loadStoredData();
  }, []);

  const updateUserProfile = async (userId: string, updates: Partial<DevUser>) => {
    setUsers((prev) => {
      const updated = {
        user1: prev.user1.id === userId ? { ...prev.user1, ...updates } : prev.user1,
        user2: prev.user2.id === userId ? { ...prev.user2, ...updates } : prev.user2,
      };
      StorageEngine.setItem('andrea_users_v1', updated);
      return updated;
    });
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
    StorageEngine.setItem('andrea_entries_v1', entries);
  }, [entries, isLoaded]);

  const resetAllDataToDefaults = async () => {
    await StorageEngine.clearAllData();
    setActiveRole('user2');
    setWishes(INITIAL_WISHES);
    setSavedPlaces(INITIAL_SAVED_PLACES);
    setMapPlaces(SAMPLE_MAP_PLACES);
    setCoupleEvents(INITIAL_COUPLE_EVENTS);
    setRitualSeeds(INITIAL_RITUAL_SEEDS);
    setEntries(INITIAL_ENTRIES);
  };

  const currentDevUser = activeRole === 'user1' ? users.user1 : users.user2;
  const partnerDevUser = activeRole === 'user1' ? users.user2 : users.user1;

  const weeklySummary: WeeklyRitualSummary = {
    weekStartDate: '2026-08-24',
    totalMomentsSeeded: ritualSeeds.length + wishes.length,
    gentleMessage: `Esta semana habéis guardado ${ritualSeeds.length} pequeños momentos juntos. Ya forman parte de vuestra historia.`,
    highlights: [
      'Andrea guardó el deseo "Bolso de hombro café"',
      'Ángel preparó una sorpresa para esta noche',
      'Compartisteis una nota de agradecimiento matutina'
    ]
  };

  const switchRole = (role: 'user1' | 'user2') => {
    setActiveRole(role);
  };

  const togglePremium = () => setIsPremium((prev) => !prev);
  const toggleUser1Consent = () => setUser1Consent((prev) => !prev);
  const toggleUser2Consent = () => setUser2Consent((prev) => !prev);

  // ── Wishbook Actions ──
  const addWish = (wish: Partial<WishlistItem>) => {
    const newId = 'wish-' + Date.now();
    const item: WishlistItem = {
      id: newId,
      coupleId: 'demo-couple-id',
      ownerUserId: currentDevUser.id,
      createdByUserId: currentDevUser.id,
      title: wish.title || 'Deseo sin título',
      description: wish.description,
      sourceUrl: wish.sourceUrl,
      externalImageUrl: wish.externalImageUrl,
      images: wish.images,
      type: wish.type || 'other',
      status: wish.status || 'dreaming',
      brand: wish.brand,
      estimatedPrice: wish.estimatedPrice,
      isForSelf: wish.isForSelf ?? true,
      phoneNumber: wish.phoneNumber,
      visibility: 'shared',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWishes((prev) => [item, ...prev]);
  };

  const updateWishStatus = (id: string, newStatus: WishlistStatus) => {
    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus, updatedAt: new Date().toISOString() } : w))
    );
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
      coupleId: 'demo-couple-id',
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
      coupleId: 'demo-couple-id',
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
  };

  // ── Place / Restaurant Actions ──
  const addSavedPlace = (place: Partial<Place>) => {
    const newId = 'place-' + Date.now();
    const newPlace: Place = {
      id: newId,
      coupleId: 'demo-couple-id',
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
  };

  const updatePlaceStatus = (id: string, status: Place['status']) => {
    setSavedPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p))
    );
  };

  const convertPlaceToEvent = (placeId: string, date: string, time?: string) => {
    const place = savedPlaces.find((p) => p.id === placeId);
    if (!place) return;

    const newEvent: CoupleEvent = {
      id: 'cev-' + Date.now(),
      coupleId: 'demo-couple-id',
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
      coupleId: 'demo-couple-id',
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
  const addRitualSeed = (seed: Partial<RitualSeed>) => {
    const newSeed: RitualSeed = {
      id: 'seed-' + Date.now(),
      coupleId: 'demo-couple-id',
      authorId: currentDevUser.id,
      date: seed.date || new Date().toISOString().split('T')[0],
      type: seed.type || 'gratitude_note',
      title: seed.title || 'Momento compartido',
      body: seed.body,
      imageUrl: seed.imageUrl || seed.photoUrl,
      photoUrl: seed.photoUrl || seed.imageUrl,
      mood: seed.mood || 'grateful',
      isSharedWithPartner: true,
      partnerResponded: false,
      createdAt: new Date().toISOString(),
    };

    setRitualSeeds((prev) => [newSeed, ...prev]);
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
  };

  const addEntry = (entry: Partial<DiaryEntryUI>) => {
    const newEntry: DiaryEntryUI = {
      id: 'entry-' + Date.now(),
      coupleId: 'demo-couple-id',
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
      coupleId: 'demo-couple-id',
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

  const ayaInsights = [
    {
      id: 'ins-1',
      title: 'Espacios de calma compartida',
      description: 'Ambos valoráis especialmente los momentos tranquilos de lectura y café en casa.',
      date: '28 de agosto'
    },
    {
      id: 'ins-2',
      title: 'Pasión por la gastronomía japonesa',
      description: 'Tanto Ángel como Andrea han guardado planes y deseos vinculados a cenas omakase íntimas.',
      date: '25 de agosto'
    }
  ];

  const getRandomAyaQuestion = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_AYA_QUESTIONS.length);
    return SAMPLE_AYA_QUESTIONS[randomIndex];
  };

  return (
    <DevContext.Provider
      value={{
        activeRole,
        currentDevUser,
        partnerDevUser,
        users,
        updateUserProfile,
        isPremium,
        user1Consent,
        user2Consent,
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
        getRandomAyaQuestion,
        resetAllDataToDefaults,
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
