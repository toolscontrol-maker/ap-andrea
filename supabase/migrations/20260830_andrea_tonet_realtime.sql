-- ==============================================================================
-- 💖 ANDREA APP: SUPABASE REALTIME CLOUD DATABASE MIGRATION
-- Pareja: Andrea & Tonet | Aniversario: 15 de Febrero de 2025 (Valencia)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COUPLES TABLE
CREATE TABLE IF NOT EXISTS public.couples (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Andrea & Tonet',
    start_date DATE NOT NULL DEFAULT '2025-02-15',
    city TEXT NOT NULL DEFAULT 'Valencia',
    country TEXT NOT NULL DEFAULT 'España',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.couples (id, name, start_date, city, country)
VALUES ('andrea-tonet', 'Andrea & Tonet', '2025-02-15', 'Valencia', 'España')
ON CONFLICT (id) DO NOTHING;

-- 2. PROFILES TABLE (Tonet & Andrea)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    role_key TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    avatar_photo TEXT,
    role_description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.profiles (id, couple_id, role_key, name, avatar, avatar_photo, role_description)
VALUES
    ('11111111-aaaa-bbbb-cccc-111111111111', 'andrea-tonet', 'user1', 'Tonet', 'T', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', 'Quien suele iniciar planes y documentar detalles'),
    ('22222222-dddd-eeee-ffff-222222222222', 'andrea-tonet', 'user2', 'Andrea', 'A', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', 'Quien da significado y aporta calidez espontánea')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar = EXCLUDED.avatar,
    role_description = EXCLUDED.role_description;

-- 3. WISHES TABLE
CREATE TABLE IF NOT EXISTS public.wishes (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    owner_user_id TEXT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'other',
    status TEXT NOT NULL DEFAULT 'dreaming',
    visibility TEXT NOT NULL DEFAULT 'shared',
    brand TEXT,
    source_url TEXT,
    external_image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    estimated_price NUMERIC,
    currency TEXT DEFAULT 'EUR',
    price_note TEXT,
    color TEXT,
    size TEXT,
    desired_for TEXT,
    occasion TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_for_self BOOLEAN DEFAULT TRUE,
    phone_number TEXT,
    restaurant_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SAVED PLACES & RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.saved_places (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    created_by_user_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'restaurant',
    status TEXT NOT NULL DEFAULT 'favorite',
    address TEXT,
    city TEXT DEFAULT 'Valencia',
    country TEXT DEFAULT 'España',
    country_code TEXT DEFAULT 'ES',
    phone_number TEXT,
    google_maps_url TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    cuisine JSONB DEFAULT '[]'::jsonb,
    price_level INTEGER DEFAULT 2,
    vibe TEXT DEFAULT 'romantico',
    tags JSONB DEFAULT '[]'::jsonb,
    rating_personal NUMERIC DEFAULT 5,
    note TEXT,
    cover_image_url TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    visits JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MAP PLACES / ATLAS TABLE
CREATE TABLE IF NOT EXISTS public.map_places (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    author_id TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    city_name TEXT DEFAULT 'Valencia',
    country TEXT DEFAULT 'España',
    country_code TEXT DEFAULT 'ES',
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    date DATE,
    story TEXT,
    category TEXT NOT NULL DEFAULT 'cita',
    mood_tag TEXT DEFAULT 'love',
    photos JSONB DEFAULT '[]'::jsonb,
    location_precision TEXT DEFAULT 'exact',
    visibility TEXT DEFAULT 'couple',
    is_milestone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. COUPLE EVENTS & CALENDAR TABLE
CREATE TABLE IF NOT EXISTS public.couple_events (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    owner_id TEXT NOT NULL,
    partner_id TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'important_date',
    date DATE NOT NULL,
    time TEXT,
    actual_start_at TIMESTAMPTZ,
    owner_view JSONB NOT NULL DEFAULT '{}'::jsonb,
    partner_view JSONB NOT NULL DEFAULT '{}'::jsonb,
    reveal_policy TEXT DEFAULT 'immediate',
    visibility TEXT DEFAULT 'shared',
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RITUAL SEEDS & FEELINGS
CREATE TABLE IF NOT EXISTS public.ritual_seeds (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL DEFAULT 'gratitude_note',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    mood TEXT DEFAULT 'grateful',
    image_url TEXT,
    is_shared_with_partner BOOLEAN DEFAULT TRUE,
    partner_responded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feelings (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL,
    feeling_state TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feelings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access for couple" ON public.couples FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for wishes" ON public.wishes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for saved_places" ON public.saved_places FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for map_places" ON public.map_places FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for couple_events" ON public.couple_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for ritual_seeds" ON public.ritual_seeds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for feelings" ON public.feelings FOR ALL USING (true) WITH CHECK (true);

-- 9. REALTIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_places;
ALTER PUBLICATION supabase_realtime ADD TABLE public.map_places;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ritual_seeds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feelings;

-- 10. STORAGE BUCKET FOR PHOTOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('andrea-media', 'andrea-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access and Upload to andrea-media" ON storage.objects
FOR ALL USING (bucket_id = 'andrea-media') WITH CHECK (bucket_id = 'andrea-media');
