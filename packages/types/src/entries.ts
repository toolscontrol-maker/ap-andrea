import { EntryType, EntryVisibility, MoodTag } from './database.js';

export type LocationPrecision = 'exact' | 'approximate' | 'private';
export type MemoryVisibility = 'couple' | 'author_only';

export interface DecryptedDiaryContent {
  title?: string;
  body: string;
  tags?: string[];
  weather?: string;
  highlights?: string[];
}

export interface DecryptedFeelingsContent {
  situation: string;
  thought: string;
  emotions: string[];
  bodySensation?: string;
  need: string;
  request?: string;
  freeNotes?: string;
}

export interface DecryptedSurpriseContent {
  title: string;
  description: string;
  occasion: 'cumpleaños' | 'aniversario' | 'sin_ocasión' | 'reconciliación' | 'logro' | 'otro';
  budgetRange?: [number, number];
  links?: string[];
  status: 'idea' | 'comprando' | 'listo' | 'entregado';
  scheduledFor?: string;
  executedAt?: string;
  reactionNotes?: string;
}

export interface DecryptedMemoryContent {
  title: string;
  story: string;
  photos?: string[];
  placeName?: string;
  date: string;
}

export interface MapPlace {
  id: string;
  title: string;
  cityName: string;
  country: string;
  countryCode?: string;
  lat: number;
  lng: number;
  date: string;
  story: string;
  photos?: string[];
  category: 'viaje' | 'cita' | 'especial' | 'escapada' | 'primer_encuentro';
  moodTag?: MoodTag;
  authorId: string;
  locationPrecision?: LocationPrecision;
  visibility?: MemoryVisibility;
  isMilestone?: boolean;
  isFuturePlan?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CoupleEventType =
  | 'shared_plan'
  | 'surprise'
  | 'important_date'
  | 'ritual'
  | 'reminder'
  | 'future_trip';

export type RevealPolicy =
  | 'immediately'
  | 'scheduled'
  | 'manual'
  | 'after_acceptance';

export interface EventView {
  title: string;
  subtitle?: string;
  description?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  notes?: string[];
  budget?: string;
  imageUrl?: string;
  isSecret?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'aniversario' | 'cita' | 'viaje' | 'sorpresa' | 'recuerdo' | 'ritual';
  notes?: string;
  location?: string;
  isPrivate?: boolean;
  authorId: string;
}

export interface CoupleEvent {
  id: string;
  ownerId: string;
  partnerId: string;
  eventType: CoupleEventType;
  date: string; // YYYY-MM-DD
  time?: string;
  actualStartAt: string;
  actualEndAt?: string;
  ownerView: EventView;
  partnerView: EventView;
  revealAt?: string;
  revealPolicy: RevealPolicy;
  visibility: 'shared' | 'private_until_reveal';
  status: 'scheduled' | 'revealed' | 'completed' | 'cancelled';
  surpriseCategory?: 'cena' | 'regalo' | 'flores' | 'escapada' | 'plan_juntos' | 'carta' | 'especial';
  createdAt: string;
  updatedAt: string;
}

export interface AyaQuestionPrompt {
  id: string;
  question: string;
  category: 'intimidad' | 'descubrimiento' | 'futuro' | 'cotidiano' | 'gratitud' | 'vulnerabilidad';
  target: 'pareja' | 'personal';
  deepLevel: 'suave' | 'profunda' | 'juego';
}

export interface DiaryEntryUI {
  id: string;
  coupleId: string;
  authorId: string;
  type: EntryType;
  visibility: EntryVisibility;
  date: string;
  content: DecryptedDiaryContent | DecryptedFeelingsContent | DecryptedSurpriseContent | DecryptedMemoryContent | string;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  moodTag?: MoodTag;
  mediaUrls?: string[];
  ayaInsight?: string;
  ayaConsentBoth: boolean;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
}
