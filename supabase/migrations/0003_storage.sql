-- ============================================================================
-- Testly · migration 0003 · private storage for source documents
--
-- Bucket layout:  sources/<auth-user-id>/<document-id>.pdf
-- The first path segment is the owner's id, which is what the policies below
-- check — a user can never read, write or delete another user's folder.
--
-- If your project rejects the `storage.objects` policies with
-- "must be owner of table objects", create the four policies from the
-- Supabase dashboard instead (Storage → Policies → sources) using the same
-- expressions. Everything else in this file will still apply.
-- ============================================================================

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

alter table storage.objects enable row level security;

drop policy if exists "sources_insert_own_folder" on storage.objects;
create policy "sources_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'sources'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "sources_select_own_folder" on storage.objects;
create policy "sources_select_own_folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'sources'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "sources_update_own_folder" on storage.objects;
create policy "sources_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'sources'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'sources'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "sources_delete_own_folder" on storage.objects;
create policy "sources_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'sources'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
