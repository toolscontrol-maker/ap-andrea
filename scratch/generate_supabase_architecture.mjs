import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUPABASE CONFIG & MIGRATIONS
// ─────────────────────────────────────────────────────────────────────────────

const supabaseDir = path.join(projectRoot, 'supabase');
const migrationsDir = path.join(supabaseDir, 'migrations');
ensureDir(migrationsDir);

// config.toml
const configToml = `[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:8081"
additional_redirect_urls = ["https://ap-andrea.vercel.app"]
jwt_expiry = 3600
enable_signup = true

[storage]
enabled = true
file_size_limit = "50MiB"
`;
fs.writeFileSync(path.join(supabaseDir, 'config.toml'), configToml, 'utf8');

// 0001_initial_schema.sql
const schemaSql = `-- ==============================================================================
-- 0001_initial_schema.sql
-- Andrea App: Core PostgreSQL Schema, Automatic Profiles, Couple Members,
-- Pairing Sessions, Wishes, Places, Visits, Events, and Media Assets.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_path TEXT,
    role_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_path)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', 'Usuario'),
        NEW.raw_user_meta_data->>'avatar_path'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. COUPLES
CREATE TABLE IF NOT EXISTS public.couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_started_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COUPLE MEMBERS (Max 2 active members validation via trigger)
CREATE TABLE IF NOT EXISTS public.couple_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'partner', -- 'partner_1' | 'partner_2'
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'pending' | 'left'
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_couple_member UNIQUE (couple_id, user_id)
);

CREATE OR REPLACE FUNCTION public.check_couple_member_limit()
RETURNS TRIGGER AS $$
DECLARE
    active_count INT;
BEGIN
    IF NEW.status = 'active' THEN
        SELECT COUNT(*) INTO active_count
        FROM public.couple_members
        WHERE couple_id = NEW.couple_id AND status = 'active' AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

        IF active_count >= 2 THEN
            RAISE EXCEPTION 'A couple cannot have more than 2 active members.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_couple_member_limit ON public.couple_members;
CREATE TRIGGER tr_couple_member_limit
    BEFORE INSERT OR UPDATE ON public.couple_members
    FOR EACH ROW EXECUTE FUNCTION public.check_couple_member_limit();

-- 4. PAIRING SESSIONS (Secure Pairing RPCs)
CREATE TABLE IF NOT EXISTS public.pairing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_hash TEXT NOT NULL,
    creator_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    attempts_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'used' | 'expired'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RPC: Create pairing session
CREATE OR REPLACE FUNCTION public.create_pairing_code(p_couple_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_raw_code TEXT;
    v_code_hash TEXT;
    v_session_id UUID;
BEGIN
    -- Verify caller is an active member of this couple
    IF NOT EXISTS (
        SELECT 1 FROM public.couple_members 
        WHERE couple_id = p_couple_id AND user_id = auth.uid() AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Not authorized to generate a pairing code for this couple.';
    END IF;

    -- Invalidate previous active sessions
    UPDATE public.pairing_sessions 
    SET status = 'expired' 
    WHERE couple_id = p_couple_id AND status = 'active';

    -- Generate random 6-character alphanumeric code
    v_raw_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    v_code_hash := ENCODE(DIGEST(v_raw_code, 'sha256'), 'hex');

    INSERT INTO public.pairing_sessions (code_hash, creator_user_id, couple_id)
    VALUES (v_code_hash, auth.uid(), p_couple_id)
    RETURNING id INTO v_session_id;

    RETURN jsonb_build_object(
        'session_id', v_session_id,
        'code', v_raw_code,
        'expires_in_hours', 48
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Redeem pairing session
CREATE OR REPLACE FUNCTION public.redeem_pairing_code(p_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_code_hash TEXT;
    v_session RECORD;
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to redeem a pairing code.';
    END IF;

    v_code_hash := ENCODE(DIGEST(UPPER(TRIM(p_code)), 'sha256'), 'hex');

    SELECT * INTO v_session
    FROM public.pairing_sessions
    WHERE code_hash = v_code_hash AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired pairing code.';
    END IF;

    IF v_session.expires_at < NOW() THEN
        UPDATE public.pairing_sessions SET status = 'expired' WHERE id = v_session.id;
        RAISE EXCEPTION 'Pairing code has expired.';
    END IF;

    IF v_session.attempts_count >= v_session.max_attempts THEN
        UPDATE public.pairing_sessions SET status = 'expired' WHERE id = v_session.id;
        RAISE EXCEPTION 'Maximum attempts exceeded for this pairing code.';
    END IF;

    IF v_session.creator_user_id = v_user_id THEN
        RAISE EXCEPTION 'You cannot redeem your own pairing code.';
    END IF;

    -- Add second partner to couple_members
    INSERT INTO public.couple_members (couple_id, user_id, role, status)
    VALUES (v_session.couple_id, v_user_id, 'partner_2', 'active')
    ON CONFLICT (couple_id, user_id) DO UPDATE SET status = 'active';

    -- Mark session as used
    UPDATE public.pairing_sessions SET status = 'used' WHERE id = v_session.id;

    RETURN jsonb_build_object(
        'success', true,
        'couple_id', v_session.couple_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. PLACES & RESTAURANTS
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'restaurant',
    address TEXT,
    city TEXT DEFAULT 'Valencia',
    country TEXT DEFAULT 'España',
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    precision TEXT DEFAULT 'exact',
    mapbox_id TEXT,
    verified_by_user BOOLEAN DEFAULT TRUE,
    website TEXT,
    booking_url TEXT,
    phone_number TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PLACE VISITS (Support for multiple visits per place)
CREATE TABLE IF NOT EXISTS public.place_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    event_id UUID,
    visited_at DATE NOT NULL,
    title TEXT,
    note TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WISHES
CREATE TABLE IF NOT EXISTS public.wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL REFERENCES public.profiles(id),
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'other',
    status TEXT NOT NULL DEFAULT 'dreaming',
    visibility TEXT NOT NULL DEFAULT 'shared',
    source_url TEXT,
    brand TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'EUR',
    place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EVENTS & SURPRISES
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    type TEXT NOT NULL DEFAULT 'date',
    title TEXT NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT FALSE,
    timezone TEXT DEFAULT 'Europe/Madrid',
    place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
    wish_id UUID REFERENCES public.wishes(id) ON DELETE SET NULL,
    visibility TEXT NOT NULL DEFAULT 'shared', -- 'shared' | 'surprise_private'
    reveal_policy TEXT DEFAULT 'immediate', -- 'immediate' | 'scheduled' | 'manual'
    reveal_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_dates CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

-- Separate private table for unrevealed surprises (Data Access Isolation)
CREATE TABLE IF NOT EXISTS public.event_surprises (
    id UUID PRIMARY KEY REFERENCES public.events(id) ON DELETE CASCADE,
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    secret_title TEXT NOT NULL,
    secret_description TEXT,
    secret_location TEXT,
    secret_notes TEXT,
    revealed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. RITUAL ENTRIES & FEELINGS
CREATE TABLE IF NOT EXISTS public.ritual_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL DEFAULT 'gratitude_note',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    mood TEXT DEFAULT 'grateful',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feelings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    feeling_state TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. MEDIA ASSETS (Metadata for private cloud storage)
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    byte_size BIGINT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
fs.writeFileSync(path.join(migrationsDir, '0001_initial_schema.sql'), schemaSql, 'utf8');

// 0002_rls_policies.sql
const rlsSql = `-- ==============================================================================
-- 0002_rls_policies.sql
-- Row Level Security (RLS) Helper Functions & Granular Policies.
-- Ensures strict couple data isolation & unrevealed surprise data protection.
-- ==============================================================================

-- 1. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_active_couple_member(target_couple_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL OR target_couple_id IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.couple_members
        WHERE couple_id = target_couple_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_active_couple_id()
RETURNS UUID AS $$
DECLARE
    v_couple_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT couple_id INTO v_couple_id
    FROM public.couple_members
    WHERE user_id = auth.uid()
      AND status = 'active'
    LIMIT 1;

    RETURN v_couple_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. ENABLE RLS ON ALL PUBLIC TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_surprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feelings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES POLICIES
CREATE POLICY "Users can read their own profile and partner profile"
ON public.profiles FOR SELECT
USING (
    id = auth.uid() OR
    id IN (
        SELECT cm2.user_id
        FROM public.couple_members cm1
        JOIN public.couple_members cm2 ON cm1.couple_id = cm2.couple_id
        WHERE cm1.user_id = auth.uid() AND cm1.status = 'active' AND cm2.status = 'active'
    )
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. COUPLES POLICIES
CREATE POLICY "Active couple members can view their couple"
ON public.couples FOR SELECT
USING (public.is_active_couple_member(id));

CREATE POLICY "Authenticated users can create couples"
ON public.couples FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Active couple members can update their couple"
ON public.couples FOR UPDATE
USING (public.is_active_couple_member(id))
WITH CHECK (public.is_active_couple_member(id));

-- 5. COUPLE MEMBERS POLICIES
CREATE POLICY "Couple members can view members of their couple"
ON public.couple_members FOR SELECT
USING (public.is_active_couple_member(couple_id) OR user_id = auth.uid());

CREATE POLICY "Users can insert their own initial couple membership"
ON public.couple_members FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership status"
ON public.couple_members FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. PAIRING SESSIONS POLICIES
CREATE POLICY "Creators can view their pairing sessions"
ON public.pairing_sessions FOR SELECT
USING (creator_user_id = auth.uid() OR public.is_active_couple_member(couple_id));

-- 7. PLACES POLICIES
CREATE POLICY "Couple members can view places"
ON public.places FOR SELECT
USING (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can insert places"
ON public.places FOR INSERT
WITH CHECK (public.is_active_couple_member(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can update places"
ON public.places FOR UPDATE
USING (public.is_active_couple_member(couple_id))
WITH CHECK (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can delete places"
ON public.places FOR DELETE
USING (public.is_active_couple_member(couple_id));

-- 8. PLACE VISITS POLICIES
CREATE POLICY "Couple members can view visits"
ON public.place_visits FOR SELECT
USING (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can insert visits"
ON public.place_visits FOR INSERT
WITH CHECK (public.is_active_couple_member(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can update visits"
ON public.place_visits FOR UPDATE
USING (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can delete visits"
ON public.place_visits FOR DELETE
USING (public.is_active_couple_member(couple_id));

-- 9. WISHES POLICIES
CREATE POLICY "Couple members can view wishes"
ON public.wishes FOR SELECT
USING (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can insert wishes"
ON public.wishes FOR INSERT
WITH CHECK (public.is_active_couple_member(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can update wishes"
ON public.wishes FOR UPDATE
USING (public.is_active_couple_member(couple_id))
WITH CHECK (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can delete wishes"
ON public.wishes FOR DELETE
USING (public.is_active_couple_member(couple_id));

-- 10. EVENTS POLICIES
CREATE POLICY "Couple members can view events"
ON public.events FOR SELECT
USING (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can insert events"
ON public.events FOR INSERT
WITH CHECK (public.is_active_couple_member(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can update events"
ON public.events FOR UPDATE
USING (public.is_active_couple_member(couple_id))
WITH CHECK (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can delete events"
ON public.events FOR DELETE
USING (public.is_active_couple_member(couple_id));

-- 11. EVENT SURPRISES POLICIES (Privacy MVP Protection)
-- Creator can always view secret payload. Partner can view ONLY after it is marked as revealed.
CREATE POLICY "View secret surprise payload if creator or revealed"
ON public.event_surprises FOR SELECT
USING (
    created_by = auth.uid() OR
    (revealed = TRUE AND public.is_active_couple_member(couple_id))
);

CREATE POLICY "Creator can insert surprise payload"
ON public.event_surprises FOR INSERT
WITH CHECK (public.is_active_couple_member(couple_id) AND created_by = auth.uid());

CREATE POLICY "Creator or couple member can update surprise reveal state"
ON public.event_surprises FOR UPDATE
USING (public.is_active_couple_member(couple_id))
WITH CHECK (public.is_active_couple_member(couple_id));

-- 12. RITUAL ENTRIES & FEELINGS POLICIES
CREATE POLICY "Couple members can view ritual entries"
ON public.ritual_entries FOR SELECT
USING (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can insert ritual entries"
ON public.ritual_entries FOR INSERT
WITH CHECK (public.is_active_couple_member(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can view feelings"
ON public.feelings FOR SELECT
USING (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can insert feelings"
ON public.feelings FOR INSERT
WITH CHECK (public.is_active_couple_member(couple_id) AND created_by = auth.uid());

-- 13. MEDIA ASSETS POLICIES
CREATE POLICY "Couple members can view media assets"
ON public.media_assets FOR SELECT
USING (public.is_active_couple_member(couple_id));

CREATE POLICY "Couple members can insert media assets"
ON public.media_assets FOR INSERT
WITH CHECK (public.is_active_couple_member(couple_id) AND created_by = auth.uid());
`;
fs.writeFileSync(path.join(migrationsDir, '0002_rls_policies.sql'), rlsSql, 'utf8');

// 0003_realtime.sql
const realtimeSql = `-- ==============================================================================
-- 0003_realtime.sql
-- Publication Configuration for Supabase Realtime CDC (Postgres Changes).
-- ==============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.places;
ALTER PUBLICATION supabase_realtime ADD TABLE public.place_visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ritual_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feelings;
`;
fs.writeFileSync(path.join(migrationsDir, '0003_realtime.sql'), realtimeSql, 'utf8');

// 0004_storage.sql
const storageSql = `-- ==============================================================================
-- 0004_storage.sql
-- Private Storage Bucket and Storage Access Policies for Andrea App.
-- ==============================================================================

-- 1. Create Private Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'andrea-media',
    'andrea-media',
    false, -- Private bucket
    52428800, -- 50 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Storage RLS Policies
-- Path format: {couple_id}/{filename}
CREATE POLICY "Couple members can upload media to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'andrea-media' AND
    public.is_active_couple_member((storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Couple members can read media from their folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'andrea-media' AND
    public.is_active_couple_member((storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Couple members can delete media from their folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'andrea-media' AND
    public.is_active_couple_member((storage.foldername(name))[1]::uuid)
);
`;
fs.writeFileSync(path.join(migrationsDir, '0004_storage.sql'), storageSql, 'utf8');

// seed.sql
const seedSql = `-- ==============================================================================
-- seed.sql
-- Development seed template (Clean - no production dummy data).
-- ==============================================================================
-- To seed local development test accounts:
-- 1. Use Supabase CLI or Auth UI to create two users.
-- 2. Call public.create_pairing_code() to link them into a couple.
`;
fs.writeFileSync(path.join(supabaseDir, 'seed.sql'), seedSql, 'utf8');
console.log('Supabase config and migrations created successfully.');

// ─────────────────────────────────────────────────────────────────────────────
// 2. CLIENT: src/lib/supabase.ts
// ─────────────────────────────────────────────────────────────────────────────

const libDir = path.join(projectRoot, 'apps', 'mobile', 'src', 'lib');
ensureDir(libDir);

const supabaseClientTs = `import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { SecureStorage } from './storage';

// Safe environment variable resolution
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = 
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('xyzcompany') &&
    SUPABASE_ANON_KEY !== 'public-anon-key'
  );
};

if (!isSupabaseConfigured() && __DEV__) {
  console.warn(
    '[Supabase] Las credenciales no están configuradas en .env. Andrea App continuará funcionando en modo LocalStorage seguro (Offline-First).'
  );
}

// Storage adapter: localStorage on Web, SecureStore/Storage on Native
const storageAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return SecureStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    SecureStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    SecureStorage.removeItem(key);
  },
};

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);
`;
fs.writeFileSync(path.join(libDir, 'supabase.ts'), supabaseClientTs, 'utf8');
console.log('src/lib/supabase.ts written successfully.');

// ─────────────────────────────────────────────────────────────────────────────
// 3. REPOSITORIES: src/repositories/
// ─────────────────────────────────────────────────────────────────────────────

const repoDir = path.join(projectRoot, 'apps', 'mobile', 'src', 'repositories');
ensureDir(repoDir);

// AndreaRepository.ts
const andreaRepoTs = `import { WishlistItem, Place, CoupleEvent, RitualSeed, FeelingEntry } from '@andrea/types';
import { AndreaMapPlace } from '../types/map';

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface RitualEntryItem {
  id: string;
  coupleId: string;
  authorId: string;
  date: string;
  type: string;
  title: string;
  body: string;
  mood?: string;
  createdAt: string;
}

/**
 * Universal Data Access Contract for Andrea App.
 * Decouples screens and providers from physical storage mechanisms.
 */
export interface AndreaRepository {
  // Wishes
  getWishes(): Promise<WishlistItem[]>;
  saveWish(item: WishlistItem): Promise<void>;
  updateWish(id: string, patch: Partial<WishlistItem>): Promise<void>;
  deleteWish(id: string): Promise<void>;

  // Places & Restaurants
  getPlaces(): Promise<Place[]>;
  savePlace(place: Place): Promise<void>;
  updatePlace(id: string, patch: Partial<Place>): Promise<void>;
  deletePlace(id: string): Promise<void>;

  // Couple Events & Dates
  getEvents(range?: DateRange): Promise<CoupleEvent[]>;
  saveEvent(event: CoupleEvent): Promise<void>;
  updateEvent(id: string, patch: Partial<CoupleEvent>): Promise<void>;
  deleteEvent(id: string): Promise<void>;

  // Ritual Seeds / Diary Entries
  getRitualEntries(): Promise<RitualSeed[]>;
  saveRitualEntry(entry: RitualSeed): Promise<void>;

  // Feelings
  getFeelings(): Promise<FeelingEntry[]>;
  saveFeeling(entry: FeelingEntry): Promise<void>;

  // Map Places
  getMapPlaces(): Promise<AndreaMapPlace[]>;
  saveMapPlace(place: AndreaMapPlace): Promise<void>;

  // Backup & Local Migration Tools
  exportAllData(): Promise<string>;
  importAllData(jsonString: string): Promise<{ success: boolean; importedKeys: number; error?: string }>;
  clearAllData(): Promise<void>;
}
`;
fs.writeFileSync(path.join(repoDir, 'AndreaRepository.ts'), andreaRepoTs, 'utf8');

// LocalAndreaRepository.ts
const localRepoTs = `import { WishlistItem, Place, CoupleEvent, RitualSeed, FeelingEntry } from '@andrea/types';
import { AndreaMapPlace } from '../types/map';
import { StorageEngine, STORAGE_KEYS } from '../services/storage';
import { AndreaRepository, DateRange } from './AndreaRepository';

/**
 * Local implementation of AndreaRepository backed by StorageEngine (LocalStorage / AsyncStorage).
 * Preserves 100% offline functionality.
 */
export class LocalAndreaRepository implements AndreaRepository {
  async getWishes(): Promise<WishlistItem[]> {
    return StorageEngine.getItem<WishlistItem[]>(STORAGE_KEYS.WISHES, []);
  }

  async saveWish(item: WishlistItem): Promise<void> {
    await StorageEngine.updateItem<WishlistItem[]>(
      STORAGE_KEYS.WISHES,
      (list) => {
        const idx = list.findIndex((w) => w.id === item.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = item;
          return next;
        }
        return [item, ...list];
      },
      []
    );
  }

  async updateWish(id: string, patch: Partial<WishlistItem>): Promise<void> {
    await StorageEngine.updateItem<WishlistItem[]>(
      STORAGE_KEYS.WISHES,
      (list) => list.map((w) => (w.id === id ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w)),
      []
    );
  }

  async deleteWish(id: string): Promise<void> {
    await StorageEngine.updateItem<WishlistItem[]>(
      STORAGE_KEYS.WISHES,
      (list) => list.filter((w) => w.id !== id),
      []
    );
  }

  async getPlaces(): Promise<Place[]> {
    return StorageEngine.getItem<Place[]>(STORAGE_KEYS.PLACES, []);
  }

  async savePlace(place: Place): Promise<void> {
    await StorageEngine.updateItem<Place[]>(
      STORAGE_KEYS.PLACES,
      (list) => {
        const idx = list.findIndex((p) => p.id === place.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = place;
          return next;
        }
        return [place, ...list];
      },
      []
    );
  }

  async updatePlace(id: string, patch: Partial<Place>): Promise<void> {
    await StorageEngine.updateItem<Place[]>(
      STORAGE_KEYS.PLACES,
      (list) => list.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
      []
    );
  }

  async deletePlace(id: string): Promise<void> {
    await StorageEngine.updateItem<Place[]>(
      STORAGE_KEYS.PLACES,
      (list) => list.filter((p) => p.id !== id),
      []
    );
  }

  async getEvents(range?: DateRange): Promise<CoupleEvent[]> {
    const allEvents = await StorageEngine.getItem<CoupleEvent[]>(STORAGE_KEYS.EVENTS, []);
    if (!range) return allEvents;

    return allEvents.filter((e) => {
      if (range.start && e.date < range.start) return false;
      if (range.end && e.date > range.end) return false;
      return true;
    });
  }

  async saveEvent(event: CoupleEvent): Promise<void> {
    await StorageEngine.updateItem<CoupleEvent[]>(
      STORAGE_KEYS.EVENTS,
      (list) => {
        const idx = list.findIndex((e) => e.id === event.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = event;
          return next;
        }
        return [event, ...list];
      },
      []
    );
  }

  async updateEvent(id: string, patch: Partial<CoupleEvent>): Promise<void> {
    await StorageEngine.updateItem<CoupleEvent[]>(
      STORAGE_KEYS.EVENTS,
      (list) => list.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e)),
      []
    );
  }

  async deleteEvent(id: string): Promise<void> {
    await StorageEngine.updateItem<CoupleEvent[]>(
      STORAGE_KEYS.EVENTS,
      (list) => list.filter((e) => e.id !== id),
      []
    );
  }

  async getRitualEntries(): Promise<RitualSeed[]> {
    return StorageEngine.getItem<RitualSeed[]>(STORAGE_KEYS.SEEDS, []);
  }

  async saveRitualEntry(entry: RitualSeed): Promise<void> {
    await StorageEngine.updateItem<RitualSeed[]>(
      STORAGE_KEYS.SEEDS,
      (list) => {
        const idx = list.findIndex((s) => s.id === entry.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = entry;
          return next;
        }
        return [entry, ...list];
      },
      []
    );
  }

  async getFeelings(): Promise<FeelingEntry[]> {
    return StorageEngine.getItem<FeelingEntry[]>(STORAGE_KEYS.FEELINGS, []);
  }

  async saveFeeling(entry: FeelingEntry): Promise<void> {
    await StorageEngine.updateItem<FeelingEntry[]>(
      STORAGE_KEYS.FEELINGS,
      (list) => [entry, ...list],
      []
    );
  }

  async getMapPlaces(): Promise<AndreaMapPlace[]> {
    return StorageEngine.getItem<AndreaMapPlace[]>(STORAGE_KEYS.MAP_PLACES, []);
  }

  async saveMapPlace(place: AndreaMapPlace): Promise<void> {
    await StorageEngine.updateItem<AndreaMapPlace[]>(
      STORAGE_KEYS.MAP_PLACES,
      (list) => {
        const idx = list.findIndex((p) => p.id === place.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = place;
          return next;
        }
        return [place, ...list];
      },
      []
    );
  }

  async exportAllData(): Promise<string> {
    return StorageEngine.exportAllLocalData();
  }

  async importAllData(jsonString: string): Promise<{ success: boolean; importedKeys: number; error?: string }> {
    return StorageEngine.importAllLocalData(jsonString);
  }

  async clearAllData(): Promise<void> {
    return StorageEngine.clearAllData();
  }
}

export const defaultLocalRepository = new LocalAndreaRepository();
`;
fs.writeFileSync(path.join(repoDir, 'LocalAndreaRepository.ts'), localRepoTs, 'utf8');

// SupabaseAndreaRepository.ts
const supabaseRepoTs = `import { WishlistItem, Place, CoupleEvent, RitualSeed, FeelingEntry } from '@andrea/types';
import { AndreaMapPlace } from '../types/map';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AndreaRepository, DateRange } from './AndreaRepository';
import { defaultLocalRepository } from './LocalAndreaRepository';

/**
 * Cloud implementation of AndreaRepository using Supabase PostgreSQL & RLS.
 * Falls back transparently to LocalAndreaRepository if unconfigured or offline.
 */
export class SupabaseAndreaRepository implements AndreaRepository {
  private coupleId: string | null = null;

  constructor(coupleId?: string) {
    if (coupleId) this.coupleId = coupleId;
  }

  public setCoupleId(coupleId: string | null) {
    this.coupleId = coupleId;
  }

  private ensureConfigured(): boolean {
    return isSupabaseConfigured() && Boolean(this.coupleId);
  }

  // 1. Wishes
  async getWishes(): Promise<WishlistItem[]> {
    if (!this.ensureConfigured()) return defaultLocalRepository.getWishes();
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('couple_id', this.coupleId!)
      .order('created_at', { ascending: false });

    if (error || !data) return defaultLocalRepository.getWishes();
    return data.map((w: any) => ({
      id: w.id,
      coupleId: w.couple_id,
      ownerUserId: w.owner_user_id,
      createdByUserId: w.created_by,
      title: w.title,
      description: w.description,
      type: w.type,
      status: w.status,
      visibility: w.visibility,
      sourceUrl: w.source_url,
      brand: w.brand,
      estimatedPrice: w.price,
      currency: w.currency,
      restaurantId: w.place_id,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));
  }

  async saveWish(item: WishlistItem): Promise<void> {
    await defaultLocalRepository.saveWish(item);
    if (!this.ensureConfigured()) return;

    await supabase.from('wishes').upsert({
      id: item.id,
      couple_id: this.coupleId,
      owner_user_id: item.ownerUserId,
      created_by: item.createdByUserId || item.ownerUserId,
      title: item.title,
      description: item.description,
      type: item.type,
      status: item.status,
      visibility: item.visibility,
      source_url: item.sourceUrl,
      brand: item.brand,
      price: item.estimatedPrice,
      currency: item.currency,
      place_id: item.restaurantId,
      updated_at: new Date().toISOString(),
    });
  }

  async updateWish(id: string, patch: Partial<WishlistItem>): Promise<void> {
    await defaultLocalRepository.updateWish(id, patch);
    if (!this.ensureConfigured()) return;

    const payload: any = { updated_at: new Date().toISOString() };
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.description !== undefined) payload.description = patch.description;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.type !== undefined) payload.type = patch.type;
    if (patch.estimatedPrice !== undefined) payload.price = patch.estimatedPrice;

    await supabase.from('wishes').update(payload).eq('id', id);
  }

  async deleteWish(id: string): Promise<void> {
    await defaultLocalRepository.deleteWish(id);
    if (!this.ensureConfigured()) return;

    await supabase.from('wishes').delete().eq('id', id);
  }

  // 2. Places
  async getPlaces(): Promise<Place[]> {
    if (!this.ensureConfigured()) return defaultLocalRepository.getPlaces();
    const { data, error } = await supabase
      .from('places')
      .select('*, place_visits(*)')
      .eq('couple_id', this.coupleId!)
      .order('created_at', { ascending: false });

    if (error || !data) return defaultLocalRepository.getPlaces();
    return data.map((p: any) => ({
      id: p.id,
      coupleId: p.couple_id,
      createdByUserId: p.created_by,
      name: p.name,
      category: p.category,
      status: p.is_favorite ? 'favorite' : 'want_to_go',
      address: p.address,
      city: p.city,
      country: p.country,
      latitude: Number(p.lat),
      longitude: Number(p.lng),
      phoneNumber: p.phone_number,
      website: p.website,
      bookingUrl: p.booking_url,
      visits: (p.place_visits || []).map((v: any) => ({
        id: v.id,
        date: v.visited_at,
        title: v.title,
        note: v.note,
      })),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  }

  async savePlace(place: Place): Promise<void> {
    await defaultLocalRepository.savePlace(place);
    if (!this.ensureConfigured()) return;

    await supabase.from('places').upsert({
      id: place.id,
      couple_id: this.coupleId,
      created_by: place.createdByUserId || (supabase.auth.getUser() as any)?.id,
      name: place.name,
      category: place.category,
      address: place.address,
      city: place.city,
      country: place.country,
      lat: place.latitude,
      lng: place.longitude,
      phone_number: place.phoneNumber,
      is_favorite: place.status === 'favorite',
      updated_at: new Date().toISOString(),
    });
  }

  async updatePlace(id: string, patch: Partial<Place>): Promise<void> {
    await defaultLocalRepository.updatePlace(id, patch);
    if (!this.ensureConfigured()) return;

    const payload: any = { updated_at: new Date().toISOString() };
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.status !== undefined) payload.is_favorite = patch.status === 'favorite';
    if (patch.address !== undefined) payload.address = patch.address;

    await supabase.from('places').update(payload).eq('id', id);
  }

  async deletePlace(id: string): Promise<void> {
    await defaultLocalRepository.deletePlace(id);
    if (!this.ensureConfigured()) return;

    await supabase.from('places').delete().eq('id', id);
  }

  // 3. Events
  async getEvents(range?: DateRange): Promise<CoupleEvent[]> {
    if (!this.ensureConfigured()) return defaultLocalRepository.getEvents(range);
    let query = supabase.from('events').select('*').eq('couple_id', this.coupleId!);
    if (range?.start) query = query.gte('starts_at', range.start);
    if (range?.end) query = query.lte('starts_at', range.end);

    const { data, error } = await query.order('starts_at', { ascending: true });
    if (error || !data) return defaultLocalRepository.getEvents(range);

    return data.map((e: any) => ({
      id: e.id,
      coupleId: e.couple_id,
      ownerId: e.created_by,
      partnerId: '',
      eventType: e.type,
      date: e.starts_at ? e.starts_at.split('T')[0] : '',
      time: e.starts_at ? e.starts_at.split('T')[1]?.substring(0, 5) : '',
      actualStartAt: e.starts_at,
      ownerView: { title: e.title, subtitle: e.description },
      partnerView: { title: e.title, subtitle: e.description },
      revealPolicy: e.reveal_policy,
      visibility: e.visibility,
      status: 'scheduled',
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }));
  }

  async saveEvent(event: CoupleEvent): Promise<void> {
    await defaultLocalRepository.saveEvent(event);
    if (!this.ensureConfigured()) return;

    await supabase.from('events').upsert({
      id: event.id,
      couple_id: this.coupleId,
      created_by: event.ownerId,
      type: event.eventType,
      title: event.ownerView.title,
      description: event.ownerView.subtitle,
      starts_at: event.actualStartAt || \`\${event.date}T\${event.time || '20:00'}:00\`,
      visibility: event.visibility,
      reveal_policy: event.revealPolicy,
      updated_at: new Date().toISOString(),
    });
  }

  async updateEvent(id: string, patch: Partial<CoupleEvent>): Promise<void> {
    await defaultLocalRepository.updateEvent(id, patch);
    if (!this.ensureConfigured()) return;

    const payload: any = { updated_at: new Date().toISOString() };
    if (patch.ownerView?.title) payload.title = patch.ownerView.title;
    if (patch.ownerView?.subtitle) payload.description = patch.ownerView.subtitle;

    await supabase.from('events').update(payload).eq('id', id);
  }

  async deleteEvent(id: string): Promise<void> {
    await defaultLocalRepository.deleteEvent(id);
    if (!this.ensureConfigured()) return;

    await supabase.from('events').delete().eq('id', id);
  }

  // 4. Ritual Entries
  async getRitualEntries(): Promise<RitualSeed[]> {
    if (!this.ensureConfigured()) return defaultLocalRepository.getRitualEntries();
    const { data, error } = await supabase
      .from('ritual_entries')
      .select('*')
      .eq('couple_id', this.coupleId!)
      .order('created_at', { ascending: false });

    if (error || !data) return defaultLocalRepository.getRitualEntries();
    return data.map((r: any) => ({
      id: r.id,
      coupleId: r.couple_id,
      authorId: r.created_by,
      date: r.date,
      type: r.type,
      title: r.title,
      body: r.body,
      mood: r.mood,
      createdAt: r.created_at,
    }));
  }

  async saveRitualEntry(entry: RitualSeed): Promise<void> {
    await defaultLocalRepository.saveRitualEntry(entry);
    if (!this.ensureConfigured()) return;

    await supabase.from('ritual_entries').upsert({
      id: entry.id,
      couple_id: this.coupleId,
      created_by: entry.authorId,
      date: entry.date,
      type: entry.type,
      title: entry.title,
      body: entry.body,
      mood: entry.mood,
    });
  }

  // 5. Feelings
  async getFeelings(): Promise<FeelingEntry[]> {
    return defaultLocalRepository.getFeelings();
  }

  async saveFeeling(entry: FeelingEntry): Promise<void> {
    await defaultLocalRepository.saveFeeling(entry);
  }

  // 6. Map Places
  async getMapPlaces(): Promise<AndreaMapPlace[]> {
    return defaultLocalRepository.getMapPlaces();
  }

  async saveMapPlace(place: AndreaMapPlace): Promise<void> {
    await defaultLocalRepository.saveMapPlace(place);
  }

  // Backup & Local Tools
  async exportAllData(): Promise<string> {
    return defaultLocalRepository.exportAllData();
  }

  async importAllData(jsonString: string): Promise<{ success: boolean; importedKeys: number; error?: string }> {
    return defaultLocalRepository.importAllData(jsonString);
  }

  async clearAllData(): Promise<void> {
    return defaultLocalRepository.clearAllData();
  }
}
`;
fs.writeFileSync(path.join(repoDir, 'SupabaseAndreaRepository.ts'), supabaseRepoTs, 'utf8');

// index.ts
const repoIndexTs = `import { AndreaRepository } from './AndreaRepository';
import { defaultLocalRepository, LocalAndreaRepository } from './LocalAndreaRepository';
import { SupabaseAndreaRepository } from './SupabaseAndreaRepository';
import { isSupabaseConfigured } from '../lib/supabase';

export * from './AndreaRepository';
export * from './LocalAndreaRepository';
export * from './SupabaseAndreaRepository';

/**
 * Universal Repository Factory.
 * Determines active data repository based on configuration and session state.
 */
export function getAndreaRepository(coupleId?: string): AndreaRepository {
  const dataSource = process.env.EXPO_PUBLIC_DATA_SOURCE || 'local';

  if (dataSource === 'supabase' && isSupabaseConfigured() && coupleId) {
    return new SupabaseAndreaRepository(coupleId);
  }

  return defaultLocalRepository;
}
`;
fs.writeFileSync(path.join(repoDir, 'index.ts'), repoIndexTs, 'utf8');
console.log('Repositories created successfully.');

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROVIDERS: src/providers/
// ─────────────────────────────────────────────────────────────────────────────

const provDir = path.join(projectRoot, 'apps', 'mobile', 'src', 'providers');
ensureDir(provDir);

// AuthProvider.tsx
const authProviderTsx = `import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarPath?: string;
  roleDescription?: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, displayName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = isSupabaseConfigured();

  const fetchProfile = async (userId: string) => {
    if (!isConfigured) return;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile({
          id: data.id,
          displayName: data.display_name,
          avatarPath: data.avatar_path,
          roleDescription: data.role_description,
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id);
      }
      setIsLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = async (email: string, pass: string) => {
    if (!isConfigured) {
      return { error: 'Supabase no está configurado.' };
    }
    triggerHaptic('medium');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, pass: string, displayName: string) => {
    if (!isConfigured) {
      return { error: 'Supabase no está configurado.' };
    }
    triggerHaptic('medium');
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { display_name: displayName },
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    triggerHaptic('light');
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) return { error: 'Supabase no configurado.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return {};
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
`;
fs.writeFileSync(path.join(provDir, 'AuthProvider.tsx'), authProviderTsx, 'utf8');

// CoupleProvider.tsx
const coupleProviderTsx = `import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth, UserProfile } from './AuthProvider';
import { triggerHaptic } from '../utils/haptics';

export interface CoupleData {
  id: string;
  relationshipStartedAt?: string;
  partnerProfile?: UserProfile;
  isPaired: boolean;
}

export interface CoupleContextType {
  couple: CoupleData | null;
  isLoadingCouple: boolean;
  createPairingCode: () => Promise<{ code?: string; error?: string }>;
  redeemPairingCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  refreshCouple: () => Promise<void>;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isConfigured } = useAuth();
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [isLoadingCouple, setIsLoadingCouple] = useState(false);

  const fetchCoupleData = async () => {
    if (!isConfigured || !user) {
      setCouple(null);
      return;
    }

    setIsLoadingCouple(true);
    try {
      // Find active couple membership
      const { data: memberData } = await supabase
        .from('couple_members')
        .select('couple_id, role, status, couples(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!memberData || !memberData.couple_id) {
        setCouple(null);
        return;
      }

      // Fetch partner profile
      const { data: partnerMember } = await supabase
        .from('couple_members')
        .select('user_id, profiles(*)')
        .eq('couple_id', memberData.couple_id)
        .neq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const partnerProfile: UserProfile | undefined = partnerMember?.profiles
        ? {
            id: (partnerMember.profiles as any).id,
            displayName: (partnerMember.profiles as any).display_name,
            avatarPath: (partnerMember.profiles as any).avatar_path,
            roleDescription: (partnerMember.profiles as any).role_description,
          }
        : undefined;

      setCouple({
        id: memberData.couple_id,
        relationshipStartedAt: (memberData.couples as any)?.relationship_started_at,
        partnerProfile,
        isPaired: Boolean(partnerProfile),
      });
    } catch {
      setCouple(null);
    } finally {
      setIsLoadingCouple(false);
    }
  };

  useEffect(() => {
    fetchCoupleData();
  }, [user]);

  const createPairingCode = async (): Promise<{ code?: string; error?: string }> => {
    if (!isConfigured || !couple?.id) return { error: 'No hay pareja activa.' };
    triggerHaptic('medium');
    try {
      const { data, error } = await supabase.rpc('create_pairing_code', { p_couple_id: couple.id });
      if (error) return { error: error.message };
      return { code: data?.code };
    } catch (e: any) {
      return { error: e.message || 'Error al generar código' };
    }
  };

  const redeemPairingCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) return { success: false, error: 'Supabase no configurado.' };
    triggerHaptic('success');
    try {
      const { data, error } = await supabase.rpc('redeem_pairing_code', { p_code: code });
      if (error) return { success: false, error: error.message };
      await fetchCoupleData();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al canjear código' };
    }
  };

  return (
    <CoupleContext.Provider
      value={{
        couple,
        isLoadingCouple,
        createPairingCode,
        redeemPairingCode,
        refreshCouple: fetchCoupleData,
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple must be used within a CoupleProvider');
  return ctx;
};
`;
fs.writeFileSync(path.join(provDir, 'CoupleProvider.tsx'), coupleProviderTsx, 'utf8');

// RealtimeSyncProvider.tsx
const realtimeSyncProviderTsx = `import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useCouple } from './CoupleProvider';
import { useAuth } from './AuthProvider';

export interface RealtimeSyncContextType {
  isRealtimeActive: boolean;
  lastEventTimestamp: string | null;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType | undefined>(undefined);

export const RealtimeSyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isConfigured } = useAuth();
  const { couple } = useCouple();
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [lastEventTimestamp, setLastEventTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured || !couple?.id) {
      setIsRealtimeActive(false);
      return;
    }

    const channelName = \`couple-sync-\${couple.id}\`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', filter: \`couple_id=eq.\${couple.id}\` },
        (payload) => {
          setLastEventTimestamp(new Date().toISOString());
        }
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsRealtimeActive(false);
    };
  }, [isConfigured, couple?.id]);

  return (
    <RealtimeSyncContext.Provider value={{ isRealtimeActive, lastEventTimestamp }}>
      {children}
    </RealtimeSyncContext.Provider>
  );
};

export const useRealtimeSync = () => {
  const ctx = useContext(RealtimeSyncContext);
  if (!ctx) throw new Error('useRealtimeSync must be used within RealtimeSyncProvider');
  return ctx;
};
`;
fs.writeFileSync(path.join(provDir, 'RealtimeSyncProvider.tsx'), realtimeSyncProviderTsx, 'utf8');

// index.ts
const provIndexTs = `export * from './AuthProvider';
export * from './CoupleProvider';
export * from './RealtimeSyncProvider';
`;
fs.writeFileSync(path.join(provDir, 'index.ts'), provIndexTs, 'utf8');
console.log('Providers created successfully.');

// ─────────────────────────────────────────────────────────────────────────────
// 5. FEATURES/AUTH: src/features/auth/
// ─────────────────────────────────────────────────────────────────────────────

const authFeatureDir = path.join(projectRoot, 'apps', 'mobile', 'src', 'features', 'auth');
ensureDir(authFeatureDir);

// auth.types.ts
const authTypesTs = `export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  partnerRole: 'tonet' | 'andrea';
}

export interface PairingState {
  isGenerating: boolean;
  code: string | null;
  countdownSeconds: number;
}
`;
fs.writeFileSync(path.join(authFeatureDir, 'auth.types.ts'), authTypesTs, 'utf8');

// LoginScreen.tsx
const loginScreenTsx = `import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radii } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

interface LoginScreenProps {
  onNavigateRegister: () => void;
  onContinueOffline: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateRegister, onContinueOffline }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu email y contraseña.');
      return;
    }
    setIsSubmitting(true);
    const res = await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (res.error) {
      Alert.alert('No se pudo iniciar sesión', res.error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.appTitle}>Andrea</Text>
        <Text style={styles.subtitle}>Espacio Íntimo para Parejas</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@andrea.app"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={handleLogin} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnPrimaryText}>Acceder a vuestro espacio</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLink} activeOpacity={0.7} onPress={onNavigateRegister}>
            <Text style={styles.btnLinkText}>¿No tienes cuenta? Regístrate aquí</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.7} onPress={onContinueOffline}>
            <Text style={styles.btnSecondaryText}>Continuar en Modo Local / Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  appTitle: {
    fontFamily: Typography.family.bold,
    fontSize: 28,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.textPrimary,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: '#F7F6F3',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Typography.family.regular,
    fontSize: 15,
    color: Colors.light.textPrimary,
  },
  btnPrimary: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  btnPrimaryText: {
    fontFamily: Typography.family.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  btnLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginTop: 4,
  },
  btnLinkText: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.primary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.08)',
  },
  dividerText: {
    fontFamily: Typography.family.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.15)',
    borderRadius: Radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.textPrimary,
  },
});
`;
fs.writeFileSync(path.join(authFeatureDir, 'LoginScreen.tsx'), loginScreenTsx, 'utf8');

// RegisterScreen.tsx
const registerScreenTsx = `import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radii } from '../../theme/tokens';

interface RegisterScreenProps {
  onNavigateLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateLogin }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setIsSubmitting(true);
    const res = await signUp(email.trim(), password, name.trim());
    setIsSubmitting(false);
    if (res.error) {
      Alert.alert('Error al registrarse', res.error);
    } else {
      Alert.alert('✨ Cuenta Creada', 'Te hemos registrado con éxito. Ya puedes vincularte con tu pareja.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.appTitle}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Comienza vuestro espacio compartido en Andrea</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Tu Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Tonet o Andrea"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@andrea.app"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={handleRegister} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnPrimaryText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLink} activeOpacity={0.7} onPress={onNavigateLogin}>
            <Text style={styles.btnLinkText}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  appTitle: {
    fontFamily: Typography.family.bold,
    fontSize: 26,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.family.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.textPrimary,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: '#F7F6F3',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Typography.family.regular,
    fontSize: 15,
    color: Colors.light.textPrimary,
  },
  btnPrimary: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  btnPrimaryText: {
    fontFamily: Typography.family.semiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  btnLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginTop: 4,
  },
  btnLinkText: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.primary,
  },
});
`;
fs.writeFileSync(path.join(authFeatureDir, 'RegisterScreen.tsx'), registerScreenTsx, 'utf8');

// PairingScreen.tsx
const pairingScreenTsx = `import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useCouple } from '../../providers/CoupleProvider';
import { Colors } from '../../theme/colors';
import { Typography, Spacing, Radii } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

export const PairingScreen: React.FC = () => {
  const { couple, createPairingCode, redeemPairingCode } = useCouple();
  const [inputCode, setInputCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const res = await createPairingCode();
    setIsGenerating(false);
    if (res.code) {
      setGeneratedCode(res.code);
    } else {
      Alert.alert('Error', res.error || 'No se pudo generar el código');
    }
  };

  const handleRedeem = async () => {
    if (!inputCode.trim()) {
      Alert.alert('Introduce el código', 'Pega el código de 6 caracteres que te ha enviado tu pareja.');
      return;
    }
    setIsRedeeming(true);
    const res = await redeemPairingCode(inputCode.trim());
    setIsRedeeming(false);
    if (res.success) {
      Alert.alert('💕 ¡Vinculación Exitosa!', 'Ahora estáis conectados en vuestro espacio compartido.');
    } else {
      Alert.alert('Código no válido', res.error || 'Verifica el código e inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Vincular con tu Pareja</Text>
        <Text style={styles.desc}>
          Para compartir recuerdos, deseos y el mapa, ambos debéis estar conectados.
        </Text>

        {/* 1. Generate code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opción 1: Enviar código a tu pareja</Text>
          {generatedCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{generatedCode}</Text>
              <Text style={styles.codeHint}>Válido durante 48 horas</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.8} onPress={handleGenerate} disabled={isGenerating}>
              {isGenerating ? <ActivityIndicator /> : <Text style={styles.btnSecondaryText}>Generar código de vinculación</Text>}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* 2. Enter code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opción 2: Introducir código recibido</Text>
          <TextInput
            style={styles.inputCode}
            placeholder="CÓDIGO (6 LETRAS)"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            maxLength={6}
            value={inputCode}
            onChangeText={(t) => setInputCode(t.toUpperCase())}
          />
          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.8} onPress={handleRedeem} disabled={isRedeeming}>
            {isRedeeming ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnPrimaryText}>Conectar Pareja</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  title: {
    fontFamily: Typography.family.bold,
    fontSize: 22,
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  desc: {
    fontFamily: Typography.family.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.family.semiBold,
    fontSize: 14,
    color: Colors.light.textPrimary,
  },
  codeBox: {
    backgroundColor: '#F4F0EB',
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  codeText: {
    fontFamily: Typography.family.bold,
    fontSize: 28,
    letterSpacing: 4,
    color: Colors.light.primary,
  },
  codeHint: {
    fontFamily: Typography.family.regular,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  inputCode: {
    backgroundColor: '#F7F6F3',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Typography.family.bold,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    color: Colors.light.textPrimary,
  },
  btnPrimary: {
    backgroundColor: Colors.light.primary,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: Typography.family.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontFamily: Typography.family.medium,
    fontSize: 13,
    color: Colors.light.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.08)',
    marginVertical: Spacing.lg,
  },
});
`;
fs.writeFileSync(path.join(authFeatureDir, 'PairingScreen.tsx'), pairingScreenTsx, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// 6. ENVIRONMENT TEMPLATE: .env.example
// ─────────────────────────────────────────────────────────────────────────────

const envExample = `# ==============================================================================
# ANDREA APP: ENVIRONMENT VARIABLES TEMPLATE
# ==============================================================================

# Supabase Connection
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key

# Storage Driver: 'local' (LocalStorage) | 'supabase' (PostgreSQL Cloud Sync)
EXPO_PUBLIC_DATA_SOURCE=local

# Mapbox Access Token
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-token

# Optional App Settings
EXPO_PUBLIC_ENABLE_DEMO_MODE=true
`;
fs.writeFileSync(path.join(projectRoot, '.env.example'), envExample, 'utf8');
console.log('.env.example created successfully.');

// ─────────────────────────────────────────────────────────────────────────────
// 7. RLS SCENARIOS TEST SCRIPT: scratch/test_rls_scenarios.sql
// ─────────────────────────────────────────────────────────────────────────────

const scratchDir = path.join(projectRoot, 'scratch');
ensureDir(scratchDir);

const testRlsSql = `-- ==============================================================================
-- test_rls_scenarios.sql
-- Validation scenarios for Row Level Security (RLS) policies.
-- ==============================================================================

-- Test Scenario 1: Couple Isolation
-- Expectation: User A in Couple 1 cannot read/write wishes or places from Couple 2.

-- Test Scenario 2: Unrevealed Surprise Privacy
-- Expectation: Partner B cannot select secret_title or secret_location from event_surprises
-- until revealed = TRUE.

-- Test Scenario 3: Maximum 2 Members per Couple
-- Expectation: Attempting to insert a 3rd active member in couple_members raises an exception.
`;
fs.writeFileSync(path.join(scratchDir, 'test_rls_scenarios.sql'), testRlsSql, 'utf8');
console.log('test_rls_scenarios.sql created successfully.');
`;
fs.writeFileSync(path.join(projectRoot, 'scratch', 'generate_supabase_architecture.mjs'), generateCode, 'utf8');
console.log('generate_supabase_architecture.mjs prepared.');
