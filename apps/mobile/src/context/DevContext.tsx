import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export interface DevUser {
  id: string;
  name: string;
  avatar: string;
  roleDescription: string;
}

export const DEV_USERS: { user1: DevUser; user2: DevUser } = {
  user1: {
    id: '11111111-aaaa-bbbb-cccc-111111111111',
    name: 'Ángel',
    avatar: 'Á',
    roleDescription: 'Quien suele iniciar planes y documentar detalles'
  },
  user2: {
    id: '22222222-dddd-eeee-ffff-222222222222',
    name: 'Andrea',
    avatar: 'A',
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
    latitude: 40.4285,
    longitude: -3.6872,
    cuisine: ['Japonesa', 'Sushi', 'Omakase'],
    priceLevel: 3,
    vibe: 'romantico',
    tags: ['para_cita_especial', 'alta_cocina', 'intimo'],
    ratingPersonal: 5,
    note: 'El sitio que Andrea guardó para nuestro próximo aniversario. Barra de 8 comensales.',
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
    id: 'place-1',
    title: 'Nuestra primera escapada a Italia',
    cityName: 'Roma',
    country: 'Italia',
    countryCode: 'IT',
    lat: 41.9028,
    lng: 12.4964,
    date: '2025-05-14',
    story: 'Paseamos por el Trastevere al atardecer, comimos el mejor helado de pistacho y nos perdimos por callejones antiguos.',
    category: 'viaje',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: false,
  },
  {
    id: 'place-2',
    title: 'Fin de semana en la Torre Eiffel',
    cityName: 'París',
    country: 'Francia',
    countryCode: 'FR',
    lat: 48.8566,
    lng: 2.3522,
    date: '2025-09-22',
    story: 'Cena con vistas al Sena. Hicimos un brindis por todos los planes que están por venir.',
    category: 'viaje',
    moodTag: 'happy',
    photos: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user2.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: false,
  },
  {
    id: 'place-3',
    title: 'Donde empezó todo',
    cityName: 'Madrid',
    country: 'España',
    countryCode: 'ES',
    lat: 40.4168,
    lng: -3.7038,
    date: '2024-02-14',
    story: 'En el mirador del Templo de Debod viendo ponerse el sol. Hablamos durante horas como si nos conociéramos de toda la vida.',
    category: 'primer_encuentro',
    moodTag: 'grateful',
    photos: ['https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  }
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
  {
    id: 'cev-1',
    coupleId: 'demo-couple-id',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'anniversary',
    date: '2026-08-20',
    time: '20:30',
    actualStartAt: '2026-08-20T20:30:00',
    ownerView: {
      title: '❤️ Nuestro Aniversario',
      subtitle: 'Celebración de nuestro camino juntos. ¡Sin teléfonos!',
      locationName: 'Restaurante Mirador con vistas',
    },
    partnerView: {
      title: '❤️ Nuestro Aniversario',
      subtitle: 'Celebración de nuestro camino juntos. ¡Sin teléfonos!',
      locationName: 'Restaurante Mirador con vistas',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2026-08-01T10:00:00',
    updatedAt: '2026-08-20T23:00:00',
  },
  {
    id: 'cev-2',
    coupleId: 'demo-couple-id',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'surprise',
    date: '2026-08-29',
    time: '21:00',
    actualStartAt: '2026-08-29T21:00:00',
    ownerView: {
      title: 'Cena romántica en terraza secreta',
      subtitle: 'Cena a la luz de las velas en terraza con música acústica en directo.',
      locationName: 'Terraza Jardín de las Estrellas',
      notes: [
        'Confirmar reserva mesa 4 con vistas',
        'Pedir el ramo de flores para recoger a las 19:30',
        'Llevar la carta manuscrita'
      ],
      budget: '60€',
    },
    partnerView: {
      title: '✨ Cena mágica a la luz de las velas',
      subtitle: 'Dress code: Elegante. Ponte ese vestido que tanto te gusta.',
      description: 'Una noche tranquila para celebrar nosotros.',
      isSecret: true,
      notes: ['No te preocupes por la hora de vuelta', 'Punto de encuentro: 20:45 en la plaza'],
    },
    surpriseCategory: 'cena',
    revealPolicy: 'scheduled',
    revealAt: '2026-08-29T19:00:00',
    visibility: 'private_until_reveal',
    status: 'scheduled',
    createdAt: '2026-08-25T14:30:00',
    updatedAt: '2026-08-25T14:30:00',
  }
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
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<'user1' | 'user2'>('user2'); // Default to Andrea
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [user1Consent, setUser1Consent] = useState<boolean>(true);
  const [user2Consent, setUser2Consent] = useState<boolean>(true);

  const [wishes, setWishes] = useState<WishlistItem[]>(INITIAL_WISHES);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>(INITIAL_SAVED_PLACES);
  const [mapPlaces, setMapPlaces] = useState<MapPlace[]>(SAMPLE_MAP_PLACES);
  const [coupleEvents, setCoupleEvents] = useState<CoupleEvent[]>(INITIAL_COUPLE_EVENTS);
  const [ritualSeeds, setRitualSeeds] = useState<RitualSeed[]>(INITIAL_RITUAL_SEEDS);
  const [entries, setEntries] = useState<DiaryEntryUI[]>(INITIAL_ENTRIES);

  const currentDevUser = activeRole === 'user1' ? DEV_USERS.user1 : DEV_USERS.user2;
  const partnerDevUser = activeRole === 'user1' ? DEV_USERS.user2 : DEV_USERS.user1;

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

  // ── Wish Actions ──
  const addWish = (wish: Partial<WishlistItem>) => {
    const newWish: WishlistItem = {
      id: 'wish-' + Date.now(),
      coupleId: 'demo-couple-id',
      ownerUserId: currentDevUser.id,
      createdByUserId: currentDevUser.id,
      title: wish.title || 'Nuevo deseo',
      description: wish.description,
      type: wish.type || 'other',
      status: wish.status || 'dreaming',
      visibility: wish.visibility || 'shared',
      sourceUrl: wish.sourceUrl,
      sourceDomain: wish.sourceUrl ? new URL(wish.sourceUrl).hostname.replace('www.', '') : undefined,
      externalImageUrl: wish.externalImageUrl,
      brand: wish.brand,
      estimatedPrice: wish.estimatedPrice,
      currency: 'EUR',
      priceNote: wish.priceNote,
      color: wish.color,
      size: wish.size,
      occasion: wish.occasion,
      tags: wish.tags || [],
      isForSelf: wish.isForSelf ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setWishes((prev) => [newWish, ...prev]);
  };

  const updateWishStatus = (id: string, newStatus: WishlistStatus) => {
    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus, updatedAt: new Date().toISOString() } : w))
    );
  };

  const convertWishToSurprise = (wishId: string, surpriseNotes?: string) => {
    const wish = wishes.find((w) => w.id === wishId);
    if (!wish) return;

    // Create a surprise in coupleEvents
    const newSurpriseEvent: CoupleEvent = {
      id: 'cev-' + Date.now(),
      coupleId: 'demo-couple-id',
      ownerId: currentDevUser.id,
      partnerId: partnerDevUser.id,
      eventType: 'surprise',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      time: '20:00',
      actualStartAt: new Date().toISOString(),
      ownerView: {
        title: `🎁 Sorpresa: ${wish.title}`,
        subtitle: surpriseNotes || `Basado en el deseo que ${partnerDevUser.name} guardó con tanta ilusión.`,
        budget: wish.estimatedPrice ? `${wish.estimatedPrice}€` : undefined,
        imageUrl: wish.externalImageUrl
      },
      partnerView: {
        title: '✨ Tienes un regalo especial esperándote',
        subtitle: 'Alguien que te quiere mucho ha preparado algo que te hacía mucha ilusión.',
        isSecret: true
      },
      surpriseCategory: 'regalo',
      revealPolicy: 'manual',
      visibility: 'private_until_reveal',
      status: 'scheduled',
      linkedWishlistId: wishId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCoupleEvents((prev) => [newSurpriseEvent, ...prev]);
    // Update wish state
    setWishes((prev) =>
      prev.map((w) => (w.id === wishId ? { ...w, status: 'in_progress', isSurpriseCandidate: true } : w))
    );
  };

  const convertWishToMemory = (wishId: string, story: string, photoUrl?: string) => {
    const wish = wishes.find((w) => w.id === wishId);
    if (!wish) return;

    const newMapMemory: MapPlace = {
      id: 'mem-' + Date.now(),
      title: `✨ Cumplido: ${wish.title}`,
      cityName: 'Madrid',
      country: 'España',
      lat: 40.4168,
      lng: -3.7038,
      date: new Date().toISOString().split('T')[0],
      story: story || `Hicimos realidad este deseo juntos. Un momento inolvidable.`,
      category: 'cita',
      moodTag: 'love',
      photos: photoUrl ? [photoUrl] : wish.externalImageUrl ? [wish.externalImageUrl] : [],
      authorId: currentDevUser.id,
      isMilestone: true,
      visibility: 'couple'
    };

    setMapPlaces((prev) => [newMapMemory, ...prev]);
    setWishes((prev) =>
      prev.map((w) => (w.id === wishId ? { ...w, status: 'fulfilled', updatedAt: new Date().toISOString() } : w))
    );
  };

  const deleteWish = (id: string) => {
    setWishes((prev) => prev.filter((w) => w.id !== id));
  };

  // ── Place Actions ──
  const addSavedPlace = (place: Partial<Place>) => {
    const newPlace: Place = {
      id: 'place-' + Date.now(),
      coupleId: 'demo-couple-id',
      createdByUserId: currentDevUser.id,
      name: place.name || 'Nuevo Lugar',
      category: place.category || 'restaurant',
      status: place.status || 'want_to_go',
      address: place.address,
      city: place.city || 'Madrid',
      country: place.country || 'España',
      latitude: place.latitude || 40.4168,
      longitude: place.longitude || -3.7038,
      cuisine: place.cuisine || [],
      priceLevel: place.priceLevel || 2,
      vibe: place.vibe || 'romantico',
      tags: place.tags || [],
      note: place.note,
      coverImageUrl: place.coverImageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop',
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
      eventType: 'restaurant_reservation',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '21:00',
      actualStartAt: `${date}T${time || '21:00'}:00`,
      ownerView: {
        title: `Cena en ${place.name}`,
        subtitle: `${place.cuisine?.join(', ')} · ${place.city}`,
        locationName: `${place.name} (${place.address || place.city})`,
        imageUrl: place.coverImageUrl,
        notes: [place.note || '¡Ganas de probarlo juntos!']
      },
      partnerView: {
        title: `Cena en ${place.name}`,
        subtitle: `${place.cuisine?.join(', ')} · ${place.city}`,
        locationName: `${place.name} (${place.address || place.city})`,
        imageUrl: place.coverImageUrl
      },
      revealPolicy: 'immediate',
      visibility: 'shared',
      status: 'scheduled',
      linkedPlaceId: placeId,
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

  // ── Ritual Actions ──
  const addRitualSeed = (seed: Partial<RitualSeed>) => {
    const newSeed: RitualSeed = {
      id: 'seed-' + Date.now(),
      coupleId: 'demo-couple-id',
      authorId: currentDevUser.id,
      date: new Date().toISOString().split('T')[0],
      type: seed.type || 'gratitude_note',
      title: seed.title,
      body: seed.body,
      imageUrl: seed.imageUrl,
      mood: seed.mood,
      isSharedWithPartner: true,
      createdAt: new Date().toISOString()
    };
    setRitualSeeds((prev) => [newSeed, ...prev]);
  };

  // ── Map Actions ──
  const addMapPlace = (place: Partial<MapPlace>) => {
    const newPlace: MapPlace = {
      id: 'place-' + Date.now(),
      title: place.title || 'Nuevo Recuerdo',
      cityName: place.cityName || 'Madrid',
      country: place.country || 'España',
      lat: place.lat || 40.4168,
      lng: place.lng || -3.7038,
      date: place.date || new Date().toISOString().split('T')[0],
      story: place.story || '',
      category: place.category || 'cita',
      moodTag: place.moodTag || 'love',
      photos: place.photos || [],
      authorId: currentDevUser.id,
      visibility: 'couple'
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
      content: entry.content || '',
      moodTag: entry.moodTag,
      ayaConsentBoth: entry.ayaConsentBoth ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMine: true
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  const addSurprise = (newSurprise: Partial<DiaryEntryUI>) => {
    const item: DiaryEntryUI = {
      id: 'surp-' + Date.now(),
      coupleId: 'demo-couple-id',
      authorId: currentDevUser.id,
      type: 'surprise',
      visibility: 'private',
      date: newSurprise.date || new Date().toISOString().split('T')[0],
      content: newSurprise.content || {
        title: 'Nueva sorpresa',
        description: '',
        status: 'idea',
        occasion: 'sin_ocasión'
      },
      moodTag: newSurprise.moodTag || 'love',
      ayaConsentBoth: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMine: true
    };
    setEntries((prev) => [item, ...prev]);
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
        getRandomAyaQuestion
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
