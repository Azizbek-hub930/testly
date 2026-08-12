-- ============================================================================
-- Testly · migration 0002 · product schema
--   * documents    (uploaded source material)
--   * assessments  (a generation request + its lifecycle)
--   * questions    (generated output)
--
-- Requires 0001_core.sql.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------

create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  file_name     text not null,
  file_size     bigint not null,
  file_type     text not null,
  storage_path  text not null,
  status        text not null default 'uploading',
  error_message text,
  extracted_text text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint documents_storage_path_unique unique (storage_path),
  constraint documents_status_check check (status in ('uploading', 'processing', 'ready', 'failed')),
  constraint documents_file_name_len check (char_length(file_name) between 1 and 255),
  constraint documents_file_size_check check (file_size > 0 and file_size <= 20971520)
);

comment on table public.documents is
  'Source material uploaded by a user. The file itself lives in the private `sources` storage bucket.';
comment on column public.documents.file_size is 'Bytes. Hard-capped at 20 MB to match the storage bucket limit.';

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create index if not exists documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- assessments
-- ---------------------------------------------------------------------------

create table if not exists public.assessments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  document_id    uuid references public.documents (id) on delete set null,
  title          text,
  exam           text not null,
  section        text not null,
  question_type  text not null,
  difficulty     text not null default 'medium',
  question_count integer not null,
  status         text not null default 'draft',
  -- Flexible extras that differ per exam: IELTS passage count, the full list of
  -- selected question types, SAT domain, etc. Keeps the columns above stable.
  config         jsonb not null default '{}'::jsonb,
  error_message  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint assessments_exam_check check (exam in ('SAT', 'IELTS')),
  constraint assessments_difficulty_check check (difficulty in ('easy', 'medium', 'hard', 'mixed')),
  constraint assessments_status_check check (status in ('draft', 'processing', 'ready', 'failed')),
  constraint assessments_question_count_check check (question_count between 1 and 60),
  constraint assessments_title_len check (title is null or char_length(title) <= 160),
  constraint assessments_section_len check (char_length(section) between 1 and 80),
  constraint assessments_question_type_len check (char_length(question_type) between 1 and 120)
);

comment on table public.assessments is
  'One generation request: which source, which exam shape, and where it is in the pipeline.';

drop trigger if exists assessments_set_updated_at on public.assessments;
create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

create index if not exists assessments_user_id_created_at_idx
  on public.assessments (user_id, created_at desc);
create index if not exists assessments_document_id_idx
  on public.assessments (document_id);

-- ---------------------------------------------------------------------------
-- questions
-- ---------------------------------------------------------------------------

create table if not exists public.questions (
  id              uuid primary key default gen_random_uuid(),
  assessment_id   uuid not null references public.assessments (id) on delete cascade,
  question_number integer not null,
  question_type   text not null,
  passage         text,
  question_text   text not null,
  -- Array of { label, text } for multiple choice; empty for open formats.
  options         jsonb not null default '[]'::jsonb,
  correct_answer  text not null,
  explanation     text,
  -- Provider/model/difficulty/quality-check details. Never rendered raw.
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),

  constraint questions_number_unique unique (assessment_id, question_number),
  constraint questions_number_check check (question_number > 0),
  constraint questions_options_is_array check (jsonb_typeof(options) = 'array')
);

comment on table public.questions is
  'Generated questions. Written server-side only (service role) so the client can never fabricate output.';

create index if not exists questions_assessment_id_number_idx
  on public.questions (assessment_id, question_number);

-- ---------------------------------------------------------------------------
-- Row Level Security · every row is scoped to its owner
-- ---------------------------------------------------------------------------

alter table public.documents enable row level security;
alter table public.assessments enable row level security;
alter table public.questions enable row level security;

-- documents -----------------------------------------------------------------

drop policy if exists documents_select_own on public.documents;
create policy documents_select_own
  on public.documents for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists documents_insert_own on public.documents;
create policy documents_insert_own
  on public.documents for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists documents_update_own on public.documents;
create policy documents_update_own
  on public.documents for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists documents_delete_own on public.documents;
create policy documents_delete_own
  on public.documents for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- assessments ---------------------------------------------------------------

drop policy if exists assessments_select_own on public.assessments;
create policy assessments_select_own
  on public.assessments for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists assessments_insert_own on public.assessments;
create policy assessments_insert_own
  on public.assessments for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    -- A draft may only ever point at a document the same user owns.
    and (
      document_id is null
      or exists (
        select 1 from public.documents d
        where d.id = document_id and d.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists assessments_update_own on public.assessments;
create policy assessments_update_own
  on public.assessments for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists assessments_delete_own on public.assessments;
create policy assessments_delete_own
  on public.assessments for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- questions -----------------------------------------------------------------

drop policy if exists questions_select_own on public.questions;
create policy questions_select_own
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1 from public.assessments a
      where a.id = questions.assessment_id
        and a.user_id = (select auth.uid())
    )
  );

drop policy if exists questions_delete_own on public.questions;
create policy questions_delete_own
  on public.questions for delete
  to authenticated
  using (
    exists (
      select 1 from public.assessments a
      where a.id = questions.assessment_id
        and a.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

revoke all on public.documents from anon, authenticated;
grant select, delete on public.documents to authenticated;
grant insert (id, user_id, file_name, file_size, file_type, storage_path, status)
  on public.documents to authenticated;
grant update (file_name, status, error_message) on public.documents to authenticated;

revoke all on public.assessments from anon, authenticated;
grant select, delete on public.assessments to authenticated;
grant insert (id, user_id, document_id, title, exam, section, question_type, difficulty, question_count, config)
  on public.assessments to authenticated;
grant update (title) on public.assessments to authenticated;

-- Questions are produced by the generation pipeline (service role) — a client
-- may read and delete its own, never write them.
revoke all on public.questions from anon, authenticated;
grant select, delete on public.questions to authenticated;
