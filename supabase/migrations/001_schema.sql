-- ====================================================================
-- ANDREA APP — SUPABASE DATABASE SCHEMA MIGRATION (001_schema.sql)
-- Complete End-to-End Encrypted Schema with RLS & pgvector
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- 2. ENUMS & DOMAINS
do $$ begin
  if not exists (select 1 from pg_type where typname = 'subscription_status_type') then
    create type subscription_status_type as enum ('free', 'active', 'past_due', 'canceled');
  end if;
  if not exists (select 1 from pg_type where typname = 'entry_type_enum') then
    create type entry_type_enum as enum (
      'diary_private',
      'diary_shared',
      'feelings_private',
      'feelings_shared',
      'surprise',
      'memory',
      'daily_question',
      'map_pin'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'entry_visibility_enum') then
    create type entry_visibility_enum as enum ('private', 'shared');
  end if;
end $$;

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  partner_id uuid references public.profiles(id) on delete set null,
  pairing_code text unique,
  paired_at timestamptz,
  subscription_status subscription_status_type default 'free' not null,
  subscription_owner_id uuid references public.profiles(id) on delete set null,
  encryption_pubkey text, -- Base64 ECDH Public Key (SPKI)
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. USER KEYS TABLE (Metadata for PBKDF2 master key & wrapped private key)
create table if not exists public.user_keys (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  encrypted_private_key text not null, -- Wrapped private key (Base64)
  private_key_nonce text not null,     -- Nonce used to wrap private key (Base64)
  kdf_salt text not null,              -- Base64 salt for PBKDF2
  kdf_iterations int default 600000 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 5. COUPLE KEYS & VERSIONS TABLE
create table if not exists public.couple_keys (
  couple_id text primary key, -- Deterministic 32-char hex hash
  user1_id uuid not null references public.profiles(id) on delete cascade,
  user2_id uuid not null references public.profiles(id) on delete cascade,
  current_version_id uuid,
  created_at timestamptz default now() not null,
  constraint unique_couple_pair unique (user1_id, user2_id)
);

create table if not exists public.couple_key_versions (
  id uuid primary key default gen_random_uuid(),
  couple_id text not null references public.couple_keys(couple_id) on delete cascade,
  version_number int default 1 not null,
  encrypted_for_user1 text not null, -- AES-GCM wrapped key for user 1 (Base64)
  nonce_for_user1 text not null,
  encrypted_for_user2 text not null, -- AES-GCM wrapped key for user 2 (Base64)
  nonce_for_user2 text not null,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz
);

-- Foreign key update on couple_keys
alter table public.couple_keys
  drop constraint if exists fk_couple_current_version,
  add constraint fk_couple_current_version foreign key (current_version_id)
    references public.couple_key_versions(id) on delete set null;

-- 6. ENTRIES TABLE (Unified E2EE entries)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  couple_id text not null references public.couple_keys(couple_id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type entry_type_enum not null,
  visibility entry_visibility_enum not null,
  
  -- Encrypted Content (Payload ciphered client-side)
  encrypted_content text not null,  -- Base64 AES-GCM ciphertext
  content_nonce text not null,      -- Base64 12-byte nonce
  content_key_version uuid references public.couple_key_versions(id),
  
  -- Unencrypted Metadata for querying & UI sorting
  entry_date date not null,
  location_lat double precision,
  location_lng double precision,
  location_name text,
  mood_tag text,
  media_urls text[], -- Encrypted media URLs in Supabase Storage
  
  -- AYA Insights & Double-Consent Flags
  aya_insight_encrypted text,
  aya_insight_nonce text,
  aya_consent_both boolean default false not null,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 7. DAILY QUESTIONS & ANSWERS
create table if not exists public.daily_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  category text not null,
  active boolean default true not null,
  order_index int default 0 not null,
  created_at timestamptz default now() not null
);

create table if not exists public.daily_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.daily_questions(id) on delete cascade,
  couple_id text not null references public.couple_keys(couple_id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  encrypted_answer text not null,
  answer_nonce text not null,
  answered_at timestamptz default now() not null,
  constraint unique_question_couple_user unique(question_id, couple_id, user_id)
);

-- 8. AYA CONSENTS & RAG CONTEXT CACHE
create table if not exists public.aya_consents (
  couple_id text primary key references public.couple_keys(couple_id) on delete cascade,
  user1_consent boolean default false not null,
  user2_consent boolean default false not null,
  consent_version int default 1 not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.aya_context_cache (
  couple_id text primary key references public.couple_keys(couple_id) on delete cascade,
  embedding vector(1536), -- text-embedding-3-small
  summary_text text,      -- Consolidated context summary
  last_updated timestamptz default now() not null
);

create table if not exists public.aya_interactions (
  id uuid primary key default gen_random_uuid(),
  couple_id text not null references public.couple_keys(couple_id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null,
  question_encrypted text not null,
  question_nonce text not null,
  response_encrypted text not null,
  response_nonce text not null,
  created_at timestamptz default now() not null
);

-- 9. SUBSCRIPTIONS TABLE (Stripe)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  couple_id text not null unique references public.couple_keys(couple_id) on delete cascade,
  subscription_owner_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status subscription_status_type default 'free' not null,
  price_id text,
  current_period_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ====================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ====================================================================
create index if not exists idx_entries_couple_date on public.entries(couple_id, entry_date desc);
create index if not exists idx_entries_author on public.entries(author_id);
create index if not exists idx_entries_type on public.entries(type);
create index if not exists idx_entries_visibility on public.entries(visibility);
create index if not exists idx_daily_answers_couple on public.daily_answers(couple_id, question_id);
create index if not exists idx_daily_questions_order on public.daily_questions(order_index asc);

-- ====================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_keys enable row level security;
alter table public.couple_keys enable row level security;
alter table public.couple_key_versions enable row level security;
alter table public.entries enable row level security;
alter table public.daily_questions enable row level security;
alter table public.daily_answers enable row level security;
alter table public.aya_consents enable row level security;
alter table public.aya_context_cache enable row level security;
alter table public.aya_interactions enable row level security;
alter table public.subscriptions enable row level security;

-- PROFILES POLICIES
create policy "Users can view own profile or partner profile" on public.profiles
  for select using (
    auth.uid() = id or auth.uid() = partner_id
  );

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- USER KEYS POLICIES
create policy "Users can manage only their own keys" on public.user_keys
  for all using (auth.uid() = user_id);

-- COUPLE KEYS POLICIES
create policy "Members of the couple can view couple keys" on public.couple_keys
  for select using (
    auth.uid() = user1_id or auth.uid() = user2_id
  );

create policy "Members of the couple can view couple key versions" on public.couple_key_versions
  for select using (
    exists (
      select 1 from public.couple_keys ck
      where ck.couple_id = couple_key_versions.couple_id
        and (ck.user1_id = auth.uid() or ck.user2_id = auth.uid())
    )
  );

-- ENTRIES POLICIES
create policy "Users can select own entries" on public.entries
  for select using (author_id = auth.uid());

create policy "Users can select shared entries of their couple" on public.entries
  for select using (
    visibility = 'shared'
    and exists (
      select 1 from public.couple_keys ck
      where ck.couple_id = entries.couple_id
        and (ck.user1_id = auth.uid() or ck.user2_id = auth.uid())
    )
  );

create policy "Users can insert entries for their couple" on public.entries
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.couple_keys ck
      where ck.couple_id = entries.couple_id
        and (ck.user1_id = auth.uid() or ck.user2_id = auth.uid())
    )
  );

create policy "Authors can update own entries" on public.entries
  for update using (author_id = auth.uid());

create policy "Authors can delete own entries" on public.entries
  for delete using (author_id = auth.uid());

-- DAILY QUESTIONS POLICIES (Public to authenticated users)
create policy "Authenticated users can read daily questions" on public.daily_questions
  for select using (auth.role() = 'authenticated');

-- DAILY ANSWERS POLICIES
create policy "Users can view own answers or partner answer when both have answered" on public.daily_answers
  for select using (
    user_id = auth.uid()
    or (
      -- Partner can view only if the requesting user has also answered this question
      exists (
        select 1 from public.daily_answers my_ans
        where my_ans.question_id = daily_answers.question_id
          and my_ans.couple_id = daily_answers.couple_id
          and my_ans.user_id = auth.uid()
      )
    )
  );

create policy "Users can insert their own daily answers" on public.daily_answers
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.couple_keys ck
      where ck.couple_id = daily_answers.couple_id
        and (ck.user1_id = auth.uid() or ck.user2_id = auth.uid())
    )
  );

-- AYA CONSENTS POLICIES
create policy "Couple members can view and update consents" on public.aya_consents
  for all using (
    exists (
      select 1 from public.couple_keys ck
      where ck.couple_id = aya_consents.couple_id
        and (ck.user1_id = auth.uid() or ck.user2_id = auth.uid())
    )
  );

-- SUBSCRIPTIONS POLICIES
create policy "Couple members can view subscription status" on public.subscriptions
  for select using (
    exists (
      select 1 from public.couple_keys ck
      where ck.couple_id = subscriptions.couple_id
        and (ck.user1_id = auth.uid() or ck.user2_id = auth.uid())
    )
  );
