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

export interface DailyMeetingCheckIn {
  date: string; // YYYY-MM-DD
  tonetResponse?: 'seen' | 'not_seen' | 'wont_see';
  andreaResponse?: 'seen' | 'not_seen' | 'wont_see';
  confirmedMet?: boolean;
  wontSee?: boolean;
  notes?: string;
  updatedAt?: string;
}

export interface WeeklyPhotoEntry {
  weekId: string; // e.g. "2026-W35"
  weekRangeLabel: string;
  photoTogether?: string;
  photoTonet?: string;
  photoAndrea?: string;
  captionTogether?: string;
  captionTonet?: string;
  captionAndrea?: string;
  updatedAt?: string;
}

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
    avatarPhoto: undefined, // Sin fotos de stock
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

export const INITIAL_WISHES: WishlistItem[] = [];

export const INITIAL_SAVED_PLACES: Place[] = [];

export const SAMPLE_MAP_PLACES: MapPlace[] = [];

export const INITIAL_ENTRIES: DiaryEntryUI[] = [];

export const INITIAL_RITUAL_SEEDS: RitualSeed[] = [];

export const INITIAL_COUPLE_EVENTS: CoupleEvent[] = [
  // 1. Aniversario de la Relación (15 de Febrero)
  {
    id: 'cev-anniversary-2026',
    coupleId: 'andrea-tonet',
    ownerId: DEV_USERS.user1.id,
    partnerId: DEV_USERS.user2.id,
    eventType: 'important_date',
    date: '2026-02-15',
    time: '00:00',
    actualStartAt: '2026-02-15T00:00:00',
    ownerView: {
      title: '💕 Nuestro Aniversario (15 de Febrero)',
      subtitle: '15 de Febrero · El día que empezó oficialmente nuestra historia de amor.',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '💕 Nuestro Aniversario (15 de Febrero)',
      subtitle: '15 de Febrero · El día que empezó oficialmente nuestra historia de amor.',
      locationName: 'Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'completed',
    createdAt: '2025-02-15T00:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 2. Cumpleaños de Andrea (1 de Septiembre)
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
      subtitle: '1 de Septiembre · ¡Celebrando la vida y el cumpleaños de Andrea!',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '🎂 Cumpleaños de Andrea (1 de Septiembre)',
      subtitle: '1 de Septiembre · ¡Celebrando la vida y el cumpleaños de Andrea!',
      locationName: 'Valencia',
    },
    revealPolicy: 'immediate',
    visibility: 'shared',
    status: 'scheduled',
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-08-20T12:00:00',
  },

  // 3. Cumpleaños de Tonet (19 de Octubre)
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
      subtitle: '19 de Octubre · Celebrando un año más juntos llenos de amor e ilusión.',
      locationName: 'Valencia',
    },
    partnerView: {
      title: '🎂 Cumpleaños de Tonet (19 de Octubre)',
      subtitle: '19 de Octubre · Celebrando un año más juntos llenos de amor e ilusión.',
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
  dailyCheckIns: Record<string, DailyMeetingCheckIn>;
  weeklyPhotos: Record<string, WeeklyPhotoEntry>;
  recordDailyMeetingCheckIn: (date: string, response: 'seen' | 'not_seen' | 'wont_see', notes?: string) => Promise<void>;
  recordWeeklyPhoto: (weekId: string, type: 'together' | 'tonet' | 'andrea', photoUrl: string, caption?: string) => Promise<void>;

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
  const [dailyCheckIns, setDailyCheckIns] = useState<Record<string, DailyMeetingCheckIn>>({});
  const [weeklyPhotos, setWeeklyPhotos] = useState<Record<string, WeeklyPhotoEntry>>({});
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
      coverImageUrl: place.coverImageUrl || undefined,
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

  const recordDailyMeetingCheckIn = async (
    date: string,
    response: 'seen' | 'not_seen' | 'wont_see',
    notes?: string
  ) => {
    const isUser1 = activeRole === 'user1';
    setDailyCheckIns((prev) => {
      const existing = prev[date] || { date };
      const tonetResponse = isUser1 ? response : (existing.tonetResponse || 'pending');
      const andreaResponse = !isUser1 ? response : (existing.andreaResponse || 'pending');
      const confirmedMet = tonetResponse === 'seen' && andreaResponse === 'seen';
      const wontSee = tonetResponse === 'wont_see' || andreaResponse === 'wont_see';

      const updated: Record<string, DailyMeetingCheckIn> = {
        ...prev,
        [date]: {
          ...existing,
          date,
          tonetResponse,
          andreaResponse,
          confirmedMet,
          wontSee,
          notes: notes || existing.notes,
          updatedAt: new Date().toISOString(),
        },
      };

      StorageEngine.setItem(STORAGE_KEYS.DAILY_CHECKINS, updated);
      CloudSyncEngine.syncDailyMeetingCheckIn(updated[date]);
      return updated;
    });
  };

  const recordWeeklyPhoto = async (
    weekId: string,
    type: 'together' | 'tonet' | 'andrea',
    photoUrl: string,
    caption?: string
  ) => {
    setWeeklyPhotos((prev) => {
      const existing = prev[weekId] || {
        weekId,
        weekRangeLabel: 'Semana Actual',
      };

      const updated: Record<string, WeeklyPhotoEntry> = {
        ...prev,
        [weekId]: {
          ...existing,
          photoTogether: type === 'together' ? photoUrl : existing.photoTogether,
          photoTonet: type === 'tonet' ? photoUrl : existing.photoTonet,
          photoAndrea: type === 'andrea' ? photoUrl : existing.photoAndrea,
          captionTogether: type === 'together' ? (caption || existing.captionTogether) : existing.captionTogether,
          captionTonet: type === 'tonet' ? (caption || existing.captionTonet) : existing.captionTonet,
          captionAndrea: type === 'andrea' ? (caption || existing.captionAndrea) : existing.captionAndrea,
          updatedAt: new Date().toISOString(),
        },
      };

      StorageEngine.setItem(STORAGE_KEYS.WEEKLY_PHOTOS, updated);
      CloudSyncEngine.syncWeeklyPhoto(updated[weekId]);
      return updated;
    });
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
        dailyCheckIns,
        weeklyPhotos,
        recordDailyMeetingCheckIn,
        recordWeeklyPhoto,
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
