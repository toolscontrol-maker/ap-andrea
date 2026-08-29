export type DailyRitualType =
  | 'question_answer'
  | 'daily_photo'
  | 'gratitude_note'
  | 'feeling_check'
  | 'dream_wish'
  | 'future_plan';

export interface RitualSeed {
  id: string;
  coupleId: string;
  authorId: string;
  date: string; // YYYY-MM-DD
  type: DailyRitualType;

  title?: string;
  body?: string;
  imageUrl?: string;
  mood?: string;
  gratitudeTarget?: string;

  isSharedWithPartner: boolean;
  partnerResponded?: boolean;

  createdAt: string;
}

export interface WeeklyRitualSummary {
  weekStartDate: string;
  totalMomentsSeeded: number; // ej. 4
  gentleMessage: string; // ej. "Esta semana habéis guardado cuatro pequeños momentos juntos."
  highlights: string[];
}
