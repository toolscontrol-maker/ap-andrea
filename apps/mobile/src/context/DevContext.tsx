import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MapPlace, CalendarEvent, CoupleEvent, AyaQuestionPrompt, DiaryEntryUI } from '@andrea/types';

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
  },
  {
    id: 'place-4',
    title: 'Viaje soñado entre templos y bambú',
    cityName: 'Kioto',
    country: 'Japón',
    countryCode: 'JP',
    lat: 35.0116,
    lng: 135.7681,
    date: '2026-04-10',
    story: 'Caminata por el bosque de bambú de Arashiyama y el santuario Fushimi Inari a primera hora de la mañana.',
    category: 'viaje',
    moodTag: 'love',
    photos: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: true,
  },
  {
    id: 'place-5',
    title: 'Atardecer mágico en la Alhambra',
    cityName: 'Granada',
    country: 'España',
    countryCode: 'ES',
    lat: 37.1773,
    lng: -3.5986,
    date: '2024-11-05',
    story: 'Mirador de San Nicolás escuchando guitarra española y viendo la Alhambra iluminada bajo la luna.',
    category: 'escapada',
    moodTag: 'calm',
    photos: ['https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user2.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: false,
  },
  {
    id: 'place-6',
    title: 'Días de desconexión y arrozales',
    cityName: 'Bali (Ubud)',
    country: 'Indonesia',
    countryCode: 'ID',
    lat: -8.5069,
    lng: 115.2625,
    date: '2025-08-12',
    story: 'Desayunos tranquilos con vistas a la selva y paseos en moto entre terrazas de arroz.',
    category: 'viaje',
    moodTag: 'grateful',
    photos: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop'],
    authorId: DEV_USERS.user1.id,
    locationPrecision: 'exact',
    visibility: 'couple',
    isMilestone: false,
  }
];

export const INITIAL_COUPLE_EVENTS: CoupleEvent[] = [
  {
    id: 'cev-1',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
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
    revealPolicy: 'immediately',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2026-08-01T10:00:00',
    updatedAt: '2026-08-20T23:00:00',
  },
  {
    id: 'cev-2',
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
      title: '✨ Tienes un plan especial',
      subtitle: 'Prepárate para una noche bonita juntos.',
      isSecret: true,
    },
    revealAt: '2026-08-28T19:00:00',
    revealPolicy: 'scheduled',
    visibility: 'private_until_reveal',
    status: 'scheduled',
    surpriseCategory: 'cena',
    createdAt: '2026-08-22T12:00:00',
    updatedAt: '2026-08-22T12:00:00',
  },
  {
    id: 'cev-3',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'future_trip',
    date: '2026-09-15',
    time: '09:00',
    actualStartAt: '2026-09-15T09:00:00',
    ownerView: {
      title: '✈️ Vuelo a Roma (Escapada de Otoño)',
      subtitle: 'Escapada de 4 días en Italia para pasear por el Trastevere.',
      locationName: 'Aeropuerto T4 Barajas',
    },
    partnerView: {
      title: '✈️ Vuelo a Roma (Escapada de Otoño)',
      subtitle: 'Escapada de 4 días en Italia para pasear por el Trastevere.',
      locationName: 'Aeropuerto T4 Barajas',
    },
    revealPolicy: 'immediately',
    visibility: 'shared',
    status: 'scheduled',
    createdAt: '2026-08-10T14:00:00',
    updatedAt: '2026-08-10T14:00:00',
  },
  {
    id: 'cev-4',
    ownerId: DEV_USERS.user2.id,
    partnerId: DEV_USERS.user1.id,
    eventType: 'ritual',
    date: '2026-08-23',
    time: '19:30',
    actualStartAt: '2026-08-23T19:30:00',
    ownerView: {
      title: '🌿 Noche de películas y mantas en casa',
      subtitle: 'Hacer palomitas caseras y ver aquella película pendiente.',
      locationName: 'En el sofá',
    },
    partnerView: {
      title: '🌿 Noche de películas y mantas en casa',
      subtitle: 'Hacer palomitas caseras y ver aquella película pendiente.',
      locationName: 'En el sofá',
    },
    revealPolicy: 'immediately',
    visibility: 'shared',
    status: 'scheduled',
    createdAt: '2026-08-21T18:00:00',
    updatedAt: '2026-08-21T18:00:00',
  },
  {
    id: 'cev-5',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2026-10-12',
    time: 'Todo el día',
    actualStartAt: '2026-10-12T00:00:00',
    ownerView: {
      title: '🎁 Cumpleaños de Andrea',
      subtitle: 'Día muy especial. Tener lista la sorpresa del viaje.',
    },
    partnerView: {
      title: '🎁 Mi Cumpleaños',
      subtitle: 'Un año más celebrando juntos.',
    },
    revealPolicy: 'immediately',
    visibility: 'shared',
    status: 'scheduled',
    createdAt: '2026-08-01T09:00:00',
    updatedAt: '2026-08-01T09:00:00',
  }
];

export const SAMPLE_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: '❤️ Nuestro Aniversario',
    date: '2026-08-20',
    time: '20:30',
    type: 'aniversario',
    location: 'Restaurante especial con vistas',
    notes: 'Celebración de nuestro camino juntos. ¡Sin teléfonos!',
    authorId: DEV_USERS.user1.id
  }
];

export const SAMPLE_AYA_QUESTIONS: AyaQuestionPrompt[] = [
  {
    id: 'q-1',
    question: '¿Cuál ha sido un momento reciente en el que sentiste que hacíais un gran equipo juntos?',
    category: 'gratitud',
    target: 'pareja',
    deepLevel: 'suave'
  },
  {
    id: 'q-2',
    question: 'Si pudieras congelar una sola tarde que hayáis vivido para volver a ella siempre, ¿cuál elegirías?',
    category: 'intimidad',
    target: 'pareja',
    deepLevel: 'profunda'
  },
  {
    id: 'q-3',
    question: '¿Qué pequeño gesto cotidiano de tu pareja te hace sentir en casa y seguro/a?',
    category: 'cotidiano',
    target: 'pareja',
    deepLevel: 'suave'
  },
  {
    id: 'q-4',
    question: '¿Qué sueño o viaje os gustaría cumplir juntos en los próximos doce meses?',
    category: 'futuro',
    target: 'pareja',
    deepLevel: 'suave'
  },
  {
    id: 'q-5',
    question: '¿Hay alguna necesidad tuya de descanso o cariño que últimamente no hayas expresado en voz alta?',
    category: 'vulnerabilidad',
    target: 'personal',
    deepLevel: 'profunda'
  },
  {
    id: 'q-6',
    question: '¿Qué cualidad de tu pareja te enamoró al principio y hoy admiras incluso más?',
    category: 'descubrimiento',
    target: 'pareja',
    deepLevel: 'suave'
  }
];

export const INITIAL_AYA_INSIGHTS = [
  {
    id: 'ins-1',
    title: '🌿 Dinámica de Cuidado Mutuo',
    description: 'Ángel tiende a expresar el cariño mediante la iniciativa de planes y detalles, mientras Andrea aporta presencia, significado y calidez espontánea.',
    date: 'Agosto 2026'
  },
  {
    id: 'ins-2',
    title: '✈️ Lenguaje de Amor Compartido: Experiencias',
    description: 'Vuestras conexiones más profundas florecen en viajes y paseos sin prisa más que en regalos materiales.',
    date: 'Julio 2026'
  },
  {
    id: 'ins-3',
    title: '☕ Ritual de Conexión',
    description: 'Las tardes de fin de semana y los desayunos lentos son vuestro ancla principal para recargar energía juntos.',
    date: 'Junio 2026'
  }
];

export const INITIAL_SURPRISES: DiaryEntryUI[] = [
  {
    id: 'surp-1',
    coupleId: 'demo-couple-id',
    authorId: DEV_USERS.user1.id,
    type: 'surprise',
    visibility: 'private',
    date: '2026-08-20',
    content: {
      title: 'Noche de picnic y estrellas en el mirador',
      description: 'Preparar una cesta secreta con tabla de quesos artesanos, vino y una manta para ver el anochecer.',
      occasion: 'aniversario',
      budgetRange: [30, 60],
      status: 'idea'
    },
    moodTag: 'excited',
    ayaConsentBoth: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isMine: true
  }
];

interface AddCoupleEventPayload {
  eventType: CoupleEvent['eventType'];
  date: string;
  time?: string;
  title: string;
  subtitle?: string;
  location?: string;
  notes?: string[];
  surpriseCategory?: CoupleEvent['surpriseCategory'];
  revealPolicy?: CoupleEvent['revealPolicy'];
  revealAt?: string;
  visibility?: CoupleEvent['visibility'];
  partnerTeaserTitle?: string;
  partnerTeaserSubtitle?: string;
}

interface DevContextType {
  activeRole: 'user1' | 'user2';
  currentDevUser: DevUser;
  partnerDevUser: DevUser;
  isPremium: boolean;
  user1Consent: boolean;
  user2Consent: boolean;
  places: MapPlace[];
  calendarEvents: CalendarEvent[];
  coupleEvents: CoupleEvent[];
  surprises: DiaryEntryUI[];
  ayaInsights: typeof INITIAL_AYA_INSIGHTS;
  switchRole: (role: 'user1' | 'user2') => void;
  togglePremium: () => void;
  toggleUser1Consent: () => void;
  toggleUser2Consent: () => void;
  addPlace: (place: Omit<MapPlace, 'id' | 'authorId'>) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'authorId'>) => void;
  addCoupleEvent: (payload: AddCoupleEventPayload) => void;
  revealCoupleEvent: (id: string) => void;
  completeCoupleEvent: (id: string) => void;
  addSurprise: (surprise: Partial<DiaryEntryUI>) => void;
  updateSurpriseStatus: (id: string, newStatus: 'idea' | 'comprando' | 'listo' | 'entregado') => void;
  getRandomAyaQuestion: () => AyaQuestionPrompt;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<'user1' | 'user2'>('user1');
  const [isPremium, setIsPremium] = useState(true);
  const [user1Consent, setUser1Consent] = useState(true);
  const [user2Consent, setUser2Consent] = useState(true);
  const [places, setPlaces] = useState<MapPlace[]>(SAMPLE_MAP_PLACES);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(SAMPLE_CALENDAR_EVENTS);
  const [coupleEvents, setCoupleEvents] = useState<CoupleEvent[]>(INITIAL_COUPLE_EVENTS);
  const [surprises, setSurprises] = useState<DiaryEntryUI[]>(INITIAL_SURPRISES);
  const [ayaInsights] = useState(INITIAL_AYA_INSIGHTS);

  const currentDevUser = DEV_USERS[activeRole];
  const partnerDevUser = activeRole === 'user1' ? DEV_USERS.user2 : DEV_USERS.user1;

  const switchRole = (role: 'user1' | 'user2') => {
    setActiveRole(role);
  };

  const togglePremium = () => setIsPremium((prev) => !prev);
  const toggleUser1Consent = () => setUser1Consent((prev) => !prev);
  const toggleUser2Consent = () => setUser2Consent((prev) => !prev);

  const addPlace = (newPlace: Omit<MapPlace, 'id' | 'authorId'>) => {
    const place: MapPlace = {
      ...newPlace,
      id: 'place-' + Date.now(),
      authorId: currentDevUser.id
    };
    setPlaces((prev) => [place, ...prev]);
  };

  const addCalendarEvent = (newEvent: Omit<CalendarEvent, 'id' | 'authorId'>) => {
    const event: CalendarEvent = {
      ...newEvent,
      id: 'cal-' + Date.now(),
      authorId: currentDevUser.id
    };
    setCalendarEvents((prev) => [...prev, event]);
  };

  const addCoupleEvent = (payload: AddCoupleEventPayload) => {
    const newId = 'cev-' + Date.now();
    const isSurprise = payload.eventType === 'surprise';

    const event: CoupleEvent = {
      id: newId,
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
      revealPolicy: payload.revealPolicy || (isSurprise ? 'scheduled' : 'immediately'),
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
    setSurprises((prev) => [item, ...prev]);
  };

  const updateSurpriseStatus = (id: string, newStatus: 'idea' | 'comprando' | 'listo' | 'entregado') => {
    setSurprises((prev) =>
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
        places,
        calendarEvents,
        coupleEvents,
        surprises,
        ayaInsights,
        switchRole,
        togglePremium,
        toggleUser1Consent,
        toggleUser2Consent,
        addPlace,
        addCalendarEvent,
        addCoupleEvent,
        revealCoupleEvent,
        completeCoupleEvent,
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
