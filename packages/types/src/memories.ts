export type MemoryCategory =
  | 'primer_encuentro'
  | 'cita'
  | 'viaje'
  | 'escapada'
  | 'especial'
  | 'deseo_cumplido'
  | 'espontaneo'
  | 'aniversario';

export interface MemoryEntry {
  id: string;
  coupleId: string;
  authorId: string;

  title: string;
  story: string;
  date: string; // YYYY-MM-DD

  photos?: string[];
  coverPhotoUrl?: string;

  cityName?: string;
  country?: string;
  lat?: number;
  lng?: number;

  category: MemoryCategory;
  moodTag?: 'happy' | 'grateful' | 'love' | 'calm' | 'excited' | 'reflective';

  isMilestone?: boolean;
  isFuturePlan?: boolean;

  linkedWishId?: string;
  linkedEventId?: string;
  linkedPlaceId?: string;

  createdAt: string;
  updatedAt: string;
}
