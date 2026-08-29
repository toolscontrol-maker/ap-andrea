export type WishlistItemType =
  | 'product'
  | 'fashion'
  | 'beauty'
  | 'experience'
  | 'restaurant'
  | 'trip'
  | 'home'
  | 'memory'
  | 'other';

export type WishlistVisibility =
  | 'shared'
  | 'private'
  | 'partner_only'
  | 'surprise_candidate';

export type WishlistStatus =
  | 'dreaming'      // Me hace ilusión
  | 'considering'   // Lo estoy pensando
  | 'planned'       // Para una ocasión especial
  | 'someday'       // Algún día
  | 'in_progress'   // Ya está en camino
  | 'fulfilled'     // Se hizo realidad
  | 'archived';     // Lo guardo como recuerdo

export type WishlistPriority = 'low' | 'medium' | 'high' | 'someday';

export interface WishlistItem {
  id: string;
  coupleId: string;
  ownerUserId: string;
  createdByUserId: string;

  title: string;
  description?: string;

  type: WishlistItemType;
  status: WishlistStatus;
  visibility: WishlistVisibility;

  sourceUrl?: string;
  sourceDomain?: string;

  imageAssetId?: string;
  externalImageUrl?: string;
  images?: string[];

  brand?: string;
  storeName?: string;

  estimatedPrice?: number;
  currency?: string;
  priceMin?: number;
  priceMax?: number;
  priceNote?: string; // ej. "Menos de 50€", "Sin límite"

  color?: string;
  size?: string;
  priority?: WishlistPriority;

  desiredFor?: string; // ej. "Cumpleaños", "Navidad", "Aniversario"
  occasion?: string;
  tags?: string[];

  isForSelf?: boolean; // true = me lo quiero comprar yo; false = me haría ilusión recibirlo
  isSurpriseCandidate?: boolean;

  locationId?: string;
  restaurantId?: string;
  eventId?: string;
  surpriseId?: string;
  memoryId?: string;

  createdAt: string;
  updatedAt: string;
}
