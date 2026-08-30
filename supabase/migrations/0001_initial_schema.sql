-- ==============================================================================
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
