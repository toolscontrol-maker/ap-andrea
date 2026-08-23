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
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  authorId: string;
  title: string;
  notes?: string;
  url?: string;
  priceEstimate?: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}
