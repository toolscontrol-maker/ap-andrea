/**
 * Atlas of the Relationship: Entity-Relationship Domain Models
 * Layer 1: Physical Places (Where)
 * Layer 2: Experiences (What happened or will happen)
 * Layer 3: Chapters & Life Stages (How it groups in your story)
 * Layer 4: Emotional Memories (Narrative layer enriching any entity)
 */

import { RevealPolicy } from './events.js';

export type PlaceKind =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'hotel'
  | 'accommodation'
  | 'home'
  | 'family_home'
  | 'landmark'
  | 'nature'
  | 'neighborhood'
  | 'city'
  | 'venue'
  | 'future_destination'
  | 'other';

export interface AtlasPlace {
  id: string;
  coupleId: string;
  kind: PlaceKind;
  name: string;
  subtitle?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  cuisine?: string[];
  priceLevel?: 1 | 2 | 3 | 4;
  ratingPersonal?: number;
  coverImageUrl?: string;
  photos?: string[];
  isFavorite?: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export type ExperienceKind =
  | 'date'
  | 'plan'
  | 'restaurant_visit'
  | 'trip'
  | 'getaway'
  | 'stay'
  | 'celebration'
  | 'anniversary'
  | 'surprise'
  | 'ritual'
  | 'milestone'
  | 'day_out'
  | 'other';

export type ExperienceStatus =
  | 'idea'
  | 'planned'
  | 'confirmed'
  | 'happening'
  | 'completed'
  | 'cancelled';

export type ExperienceVisibility =
  | 'shared'
  | 'private'
  | 'recipient_limited'
  | 'revealed';

export interface AtlasExperience {
  id: string;
  coupleId: string;
  kind: ExperienceKind;
  status: ExperienceStatus;
  title: string;
  summary?: string;
  startsAt?: string;
  endsAt?: string;
  allDay?: boolean;
  timezone?: string;
  createdByUserId: string;
  visibility: ExperienceVisibility;
  revealPolicy?: RevealPolicy;
  revealAt?: string;
  coverImageUrl?: string;
  photos?: string[];
  invitedBy?: 'tonet' | 'andrea' | 'both';
  createdAt: string;
  updatedAt: string;
}

export type ExperienceItemRole =
  | 'primary_destination'
  | 'destination'
  | 'stop'
  | 'restaurant'
  | 'accommodation'
  | 'activity'
  | 'meeting_point'
  | 'home'
  | 'memory_location'
  | 'other';

export interface AtlasExperienceItem {
  id: string;
  parentExperienceId: string;
  childExperienceId?: string;
  placeId?: string;
  role: ExperienceItemRole;
  position: number;
  startsAt?: string;
  endsAt?: string;
  note?: string;
}

export type EmotionalTone =
  | 'romantic'
  | 'funny'
  | 'peaceful'
  | 'spontaneous'
  | 'intimate'
  | 'nostalgic'
  | 'important'
  | 'difficult';

export type MemoryImportance =
  | 'quiet'
  | 'special'
  | 'milestone';

export interface AtlasMemory {
  id: string;
  coupleId: string;
  title: string;
  narrative?: string;
  occurredAt?: string;
  occurredEndAt?: string;
  emotionalTone?: EmotionalTone[];
  importance: MemoryImportance;
  coverImageUrl?: string;
  photos?: string[];
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export type MemoryTargetType =
  | 'place'
  | 'experience'
  | 'chapter'
  | 'asset'
  | 'wish';

export type MemoryRelationship =
  | 'about'
  | 'occurred_at'
  | 'result_of'
  | 'part_of'
  | 'fulfills';

export interface AtlasMemoryLink {
  id: string;
  memoryId: string;
  targetType: MemoryTargetType;
  targetId: string;
  relationship: MemoryRelationship;
}

export type ChapterKind =
  | 'life_stage'
  | 'home'
  | 'city'
  | 'season'
  | 'trip_collection'
  | 'relationship_era'
  | 'custom';

export interface AtlasChapter {
  id: string;
  coupleId: string;
  kind: ChapterKind;
  title: string;
  summary?: string;
  startsAt?: string;
  endsAt?: string;
  isOngoing: boolean;
  coverImageUrl?: string;
  colorTheme?: 'coral' | 'sage' | 'lavender' | 'butter' | 'gold';
  anchorPlaceId?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export type ChapterItemRole =
  | 'anchor'
  | 'part_of'
  | 'highlight';

export interface AtlasChapterItem {
  id: string;
  chapterId: string;
  placeId?: string;
  experienceId?: string;
  memoryId?: string;
  role: ChapterItemRole;
  position: number;
}

export type MapExplorationMode = 'places' | 'moments' | 'chapters';

export type MapMarkerCategory =
  | 'food'
  | 'home'
  | 'travel'
  | 'memory'
  | 'date'
  | 'nature'
  | 'future'
  | 'general';

export interface MapMarker {
  id: string;
  entityType: 'place' | 'experience' | 'memory' | 'chapter';
  entityId: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  photos?: string[];
  category: MapMarkerCategory;
  kind: string;
  badgeText?: string;
  color?: string;
  visibility: 'shared' | 'limited' | 'hidden';
  isRevealed?: boolean;
  itemCount?: number;
  rawEntity: any;
}
