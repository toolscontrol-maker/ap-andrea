-- ==============================================================================
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
USING (public.is_active_couple_member(couple_id))
WITH CHECK (public.is_active_couple_member(couple_id));

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
