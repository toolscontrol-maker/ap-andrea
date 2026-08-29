export type SurpriseStatus = 'idea' | 'comprando' | 'listo' | 'entregado';

export interface SurpriseItem {
  id: string;
  authorId: string;
  title: string;
  description: string;
  occasion: 'cumpleaños' | 'aniversario' | 'sin_ocasión' | 'reconciliación' | 'logro' | 'otro';
  budgetMin?: number;
  budgetMax?: number;
  links?: string[];
  status: SurpriseStatus;
  scheduledFor?: string;
  executedAt?: string;
  reaction?: string;
  isSecret: boolean;
  linkedWishlistId?: string;
  linkedPlaceId?: string;
  linkedEventId?: string;
  createdAt: string;
  updatedAt?: string;
}
