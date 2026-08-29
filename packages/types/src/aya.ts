export type AyaMode = 'mediate' | 'understand_partner' | 'reflect' | 'daily_insight';

export type AyaConsentScope = 'shared_only' | 'shared_and_my_private' | 'all_consented';

export interface AyaRequest {
  userId: string;
  coupleId: string;
  question: string;
  mode: AyaMode;
  consentScope: AyaConsentScope;
}

export interface AyaSource {
  date: string;
  type: string;
  mood?: string;
}

export interface AyaResponse {
  response: string;
  sources: AyaSource[];
  suggestedActions?: string[];
  suggestedQuestions?: string[];
}

export interface AyaChatMessage {
  id: string;
  sender: 'user' | 'partner' | 'aya';
  text: string;
  photoUrl?: string;
  mode?: AyaMode;
  timestamp: string;
  sources?: AyaSource[];
}
