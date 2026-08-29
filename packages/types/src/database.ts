export type SubscriptionStatus = 'free' | 'active' | 'past_due' | 'canceled';

export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  partner_id: string | null;
  pairing_code: string | null;
  paired_at: string | null;
  subscription_status: SubscriptionStatus;
  subscription_owner_id: string | null;
  encryption_pubkey: string | null; // X25519 public key base64
  created_at: string;
  updated_at?: string | null;
}

export interface UserKeyMetadata {
  user_id: string;
  encrypted_private_key: string; // Base64
  kdf_salt: string;              // Base64
  kdf_iterations: number;
  created_at: string;
}

export interface CoupleKey {
  couple_id: string;
  current_key_id: string;
  created_at: string;
}

export interface CoupleKeyVersion {
  id: string;
  couple_id: string;
  encrypted_for_user1: string; // Base64
  encrypted_for_user2: string; // Base64
  created_at: string;
  expires_at: string | null;
  active: boolean;
}

export type EntryType =
  | 'diary_private'
  | 'diary_shared'
  | 'feelings_private'
  | 'feelings_shared'
  | 'surprise'
  | 'memory'
  | 'daily_question'
  | 'map_pin';

export type EntryVisibility = 'private' | 'shared';

export type MoodTag =
  | 'happy'
  | 'grateful'
  | 'love'
  | 'calm'
  | 'anxious'
  | 'sad'
  | 'angry'
  | 'tired'
  | 'excited'
  | 'reflective';

export interface DbEntry {
  id: string;
  couple_id: string;
  author_id: string;
  type: EntryType;
  visibility: EntryVisibility;
  encrypted_content: string; // Base64
  content_nonce: string;     // Base64
  content_key_version: string;
  entry_date: string;
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  mood_tag: MoodTag | null;
  media_urls: string[] | null;
  aya_insight_encrypted: string | null;
  aya_insight_nonce: string | null;
  aya_consent_both: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyQuestion {
  id: string;
  question_text: string;
  category: 'intimidad' | 'futuro' | 'cotidiano' | 'valores' | 'diversion' | 'gratitud' | 'necesidades';
  active: boolean;
  order_index: number;
}

export interface DailyAnswer {
  id: string;
  question_id: string;
  couple_id: string;
  user_id: string;
  encrypted_answer: string;
  answer_nonce: string;
  answered_at: string;
}

export interface AyaConsent {
  couple_id: string;
  user1_consent: boolean;
  user2_consent: boolean;
  consent_version: number;
  updated_at: string;
}

export interface AyaContextCache {
  couple_id: string;
  embedding: number[] | null;
  summary_text: string | null;
  last_updated: string;
}

export interface Subscription {
  id: string;
  couple_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  price_id: string | null;
  current_period_end: string | null;
  created_at: string;
}
