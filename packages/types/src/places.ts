export type PlaceCategory =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'hotel'
  | 'trip'
  | 'walk'
  | 'memory_spot'
  | 'future_place'
  | 'other';

export type PlaceStatus =
  | 'want_to_go'   // Pendiente / Nos gustaría ir
  | 'planned'      // Planificado
  | 'booked'       // Reservado
  | 'visited'      // Fuimos
  | 'favorite'     // Favorito de siempre
  | 'hidden_gem'   // Joya secreta
  | 'archived';

export interface PlaceVisitRecord {
  id: string;
  date: string;
  title: string;
  note?: string;
  photoUrl?: string;
}

export interface Place {
  id: string;
  coupleId: string;
  createdByUserId: string;

  name: string;
  category: PlaceCategory;
  status: PlaceStatus;

  address?: string;
  city?: string;
  country?: string;
  countryCode?: string;

  latitude?: number;
  longitude?: number;
  geohash?: string;

  websiteUrl?: string;
  bookingUrl?: string;
  instagramUrl?: string;
  googleMapsUrl?: string;
  phoneNumber?: string;

  cuisine?: string[];
  priceLevel?: 1 | 2 | 3 | 4; // 1 = € (Económico), 2 = €€ (Medio), 3 = €€€ (Especial), 4 = €€€€ (Lujo)
  vibe?: 'romantico' | 'informal' | 'vistas' | 'celebracion' | 'tranquilo' | 'animado';
  tags?: string[];

  ratingPersonal?: number; // 1 a 5
  note?: string;
  coverImageUrl?: string;
  photos?: string[];

  visits?: PlaceVisitRecord[];

  linkedWishlistItemId?: string;
  linkedEventId?: string;
  linkedMemoryId?: string;

  createdAt: string;
  updatedAt: string;
}
