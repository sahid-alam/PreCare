-- =====================================================================
-- AI Triage Assistant — initial schema
-- =====================================================================
-- Run this in the Supabase SQL editor before starting the app.
-- =====================================================================

-- ---------- sessions: one row per triage call ----------
create table public.sessions (
  id                    uuid primary key default gen_random_uuid(),
  vapi_call_id          text unique,
  status                text not null default 'active',  -- active | complete | failed
  patient_age           int,
  patient_gender        text,                            -- male | female | other | undisclosed
  language              text not null default 'en',      -- en | hi
  chief_complaint       text,
  final_tier            text,                            -- home | clinic | er
  reasoning             text,
  recommended_actions   jsonb,                           -- string[]
  red_flag_triggered    boolean not null default false,
  red_flag_categories   jsonb,                           -- string[]
  duration_seconds      int,
  started_at            timestamptz not null default now(),
  ended_at              timestamptz,
  created_at            timestamptz not null default now()
);

create index sessions_status_idx          on public.sessions (status);
create index sessions_started_at_idx      on public.sessions (started_at desc);
create index sessions_final_tier_idx      on public.sessions (final_tier);

-- ---------- transcripts: streaming utterances ----------
create table public.transcripts (
  id           bigserial primary key,
  session_id   uuid not null references public.sessions(id) on delete cascade,
  role         text not null,                            -- assistant | user
  content      text not null,
  created_at   timestamptz not null default now()
);

create index transcripts_session_id_idx   on public.transcripts (session_id, created_at);

-- ---------- symptoms: extracted via log_symptom tool call ----------
create table public.symptoms (
  id           bigserial primary key,
  session_id   uuid not null references public.sessions(id) on delete cascade,
  name         text not null,
  severity     text,                                     -- mild | moderate | severe
  duration     text,
  notes        text,
  created_at   timestamptz not null default now()
);

create index symptoms_session_id_idx      on public.symptoms (session_id);

-- ---------- audit_log: red-flag overrides + admin events ----------
create table public.audit_log (
  id           bigserial primary key,
  session_id   uuid references public.sessions(id) on delete cascade,
  event_type   text not null,                            -- red_flag_override | admin_review | error
  details      jsonb,
  created_at   timestamptz not null default now()
);

create index audit_log_session_id_idx     on public.audit_log (session_id);
create index audit_log_event_type_idx     on public.audit_log (event_type);

-- ---------- Enable Realtime on the tables the admin dashboard subscribes to ----------
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.transcripts;
alter publication supabase_realtime add table public.symptoms;

-- ---------- (Optional) Row Level Security — disabled for hackathon ----------
-- For production:
-- alter table public.sessions   enable row level security;
-- alter table public.transcripts enable row level security;
-- alter table public.symptoms   enable row level security;
-- alter table public.audit_log  enable row level security;
--
-- For the hackathon, the server uses the service role key and bypasses RLS.
-- The patient UI does not read from Supabase directly — it reads from Vapi
-- client events. The admin UI is auth-gated via Supabase Auth.
