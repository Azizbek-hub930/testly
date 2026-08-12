-- ============================================================================
-- Testly · storage diagnostic
--
-- Read-only. Lists every access policy that exists on storage.objects, so we
-- can tell "no policy created yet" apart from "policy created but written
-- differently than expected".
--
-- No rows returned  =  no storage policies exist at all.
-- ============================================================================

select
  policyname                        as "Policy name",
  cmd                               as "Operation",
  roles::text                       as "Roles",
  coalesce(qual, '—')               as "USING expression",
  coalesce(with_check, '—')         as "WITH CHECK expression"
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;
