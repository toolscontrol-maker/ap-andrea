export type RelationshipEventType =
  | 'date'
  | 'restaurant_reservation'
  | 'trip'
  | 'anniversary'
  | 'birthday'
  | 'ritual'
  | 'surprise'
  | 'wishlist_target'
  | 'memory'
  | 'shared_plan'
  | 'important_date'
  | 'future_trip';

export type CoupleEventType = RelationshipEventType;

export type RevealPolicy =
  | 'immediate'
  | 'immediately'
  | 'scheduled'
  | 'manual'
  | 'arrival'
  | 'double_blind'
  | 'after_acceptance';

export interface EventView {
  title: string;
  subtitle?: string;
  description?: string;
  dressCode?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  notes?: string[];
  budget?: string;
  imageUrl?: string;
  isSecret?: boolean;
}

export interface CoupleEvent {
  id: string;
  coupleId: string;
  ownerId: string;
  partnerId: string;
  eventType: RelationshipEventType;

  date: string;       // YYYY-MM-DD
  time?: string;       // HH:mm
  actualStartAt: string;
  actualEndAt?: string;

  ownerView: EventView;
  partnerView: EventView;

  revealAt?: string;
  revealPolicy: RevealPolicy;
  visibility: 'shared' | 'private_until_reveal' | 'private_only';
  status: 'scheduled' | 'revealed' | 'completed' | 'cancelled';

  surpriseCategory?: 'cena' | 'regalo' | 'flores' | 'escapada' | 'plan_juntos' | 'carta' | 'especial';
  linkedPlaceId?: string;
  linkedWishlistId?: string;
  linkedMemoryId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CalendarDaySummary {
  date: string;
  events: CoupleEvent[];
  hasSurprise: boolean;
  hasAnniversary: boolean;
}
