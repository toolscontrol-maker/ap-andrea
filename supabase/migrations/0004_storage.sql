-- ==============================================================================
-- 0004_storage.sql
-- Private Storage Bucket and Storage Access Policies for Andrea App.
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'andrea-media',
    'andrea-media',
    false, -- Private bucket
    52428800, -- 50 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET public = false;

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
