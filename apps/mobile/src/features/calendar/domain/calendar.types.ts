import { CoupleEvent, CoupleEventType, EventView, RevealPolicy } from '@andrea/types';

export type SurpriseActivationMode = 'self' | 'invite' | 'both' | 'total_secret';

export interface SurpriseCreationPayload {
  category: 'cena' | 'regalo' | 'flores' | 'escapada' | 'plan_juntos' | 'carta' | 'especial';
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
  notes: string[];
  revealOption: 'now' | 'one_day_before' | 'same_day_morning' | 'specific_time' | 'manual';
  visibilityPreset: 'total_secret' | 'gentle_hint' | 'visible_plan';
  hintText?: string;
}

export interface SanitizedEventItem {
  id: string;
  eventType: CoupleEventType;
  date: string;
  time?: string;
  title: string;
  subtitle?: string;
  description?: string;
  locationName?: string;
  notes?: string[];
  isOwner: boolean;
  isRevealed: boolean;
  isSecretSurprise: boolean;
  status: 'scheduled' | 'revealed' | 'completed' | 'cancelled';
  ownerId: string;
  partnerId: string;
}

export interface RomanticIdea {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  category: 'sorprender' | 'hablar' | 'celebrar' | 'conectar' | 'salir' | 'casa';
  description: string;
  actionLabel: string;
  modeType?: 'surprise' | 'random_date' | 'future_letter' | 'screen_free' | 'ritual';
}

export const CalendarColors = {
  sharedPlan: '#E05666', // Coral
  surprise: '#E86A58',
  importantDate: '#D4AF37', // Gold
  restaurant: '#D4AF37', // Butter / Gold
  ritual: '#6D9E7B', // Sage
  reminder: '#66737C',
  futureTrip: '#5C9F9A', // Lavender / Mist Blue
} as const;

export type CalendarViewMode = 'day' | 'week' | 'month' | 'history';
export type CompactViewMode = 'month' | 'agenda';

export type UniversalEventType =
  | 'date'
  | 'restaurant'
  | 'surprise'
  | 'trip'
  | 'wishlist'
  | 'important_date'
  | 'memory';

export type TimelineItemKind =
  | 'milestone'
  | 'memory'
  | 'event'
  | 'trip'
  | 'restaurant'
  | 'wish_fulfilled'
  | 'surprise_revealed';

export interface TimelineItem {
  id: string;
  kind: TimelineItemKind;
  date: string; // YYYY-MM-DD
  time?: string;
  title: string;
  subtitle?: string;
  description?: string;
  locationName?: string;
  imageUrl?: string;
  photos?: string[];
  emoji?: string;
  badgeLabel?: string;
  badgeColor?: string;
  moodTag?: string;
  isUpcoming?: boolean;
  chapterTitle?: string;
}

