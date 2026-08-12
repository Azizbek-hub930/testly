-- ============================================================================
-- Testly · migration 0003 · private storage bucket for source documents
--
-- Bucket layout:  sources/<auth-user-id>/<document-id>.pdf
--
-- ---------------------------------------------------------------------------
-- IMPORTANT: this file creates the BUCKET only.
--
-- The four access policies cannot be created from the SQL editor on a managed
-- Supabase project. `storage.objects` is owned by `supabase_storage_admin`,
-- PostgreSQL only lets a table's owner create policies on it, and `postgres` is
-- not permitted to assume that role:
--
--     ERROR: 42501: must be owner of table objects
--     ERROR: 42501: permission denied to set role "supabase_storage_admin"
--
-- Create them in the dashboard instead — see supabase/STORAGE_SETUP.md. That is
-- Supabase's supported route for storage policies, not a workaround.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sources',
  'sources',
  false,
  20971520, -- 20 MB
  array['application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
