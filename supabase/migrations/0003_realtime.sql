-- ==============================================================================
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
