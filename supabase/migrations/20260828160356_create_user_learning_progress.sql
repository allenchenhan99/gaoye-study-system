create table public.question_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  answered_count bigint not null default 0 check (answered_count >= 0),
  last_choice text check (last_choice is null or last_choice in ('A', 'B', 'C', 'D')),
  last_correct boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table public.subject_stats (
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null check (subject in ('law', 'investment', 'finance')),
  done_count bigint not null default 0 check (done_count >= 0),
  correct_count bigint not null default 0 check (
    correct_count >= 0 and correct_count <= done_count
  ),
  updated_at timestamptz not null default now(),
  primary key (user_id, subject)
);

create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table public.wrong_book (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table public.exam_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  source_key text not null,
  completed_at timestamptz not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0 and score <= total),
  created_at timestamptz not null default now(),
  unique (user_id, source_key)
);

create index exam_attempts_user_completed_at_idx
  on public.exam_attempts (user_id, completed_at desc);

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  per_round_count integer not null default 20 check (per_round_count between 1 and 200),
  exam_timer_min integer not null default 60 check (exam_timer_min between 1 and 240),
  dark_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.local_imports (
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null,
  imported_at timestamptz not null default now(),
  primary key (user_id, client_id)
);

create table public.answer_operations (
  user_id uuid not null references auth.users (id) on delete cascade,
  operation_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);

alter table public.question_progress enable row level security;
alter table public.subject_stats enable row level security;
alter table public.favorites enable row level security;
alter table public.wrong_book enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.user_settings enable row level security;
alter table public.local_imports enable row level security;
alter table public.answer_operations enable row level security;

alter table public.question_progress force row level security;
alter table public.subject_stats force row level security;
alter table public.favorites force row level security;
alter table public.wrong_book force row level security;
alter table public.exam_attempts force row level security;
alter table public.user_settings force row level security;
alter table public.local_imports force row level security;
alter table public.answer_operations force row level security;

create policy question_progress_owner on public.question_progress
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy subject_stats_owner on public.subject_stats
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy favorites_owner on public.favorites
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy wrong_book_owner on public.wrong_book
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy exam_attempts_owner on public.exam_attempts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy user_settings_owner on public.user_settings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy local_imports_owner on public.local_imports
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy answer_operations_owner on public.answer_operations
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.question_progress from anon;
revoke all on public.subject_stats from anon;
revoke all on public.favorites from anon;
revoke all on public.wrong_book from anon;
revoke all on public.exam_attempts from anon;
revoke all on public.user_settings from anon;
revoke all on public.local_imports from anon;
revoke all on public.answer_operations from anon;

grant select, insert, update, delete on public.question_progress to authenticated;
grant select, insert, update, delete on public.subject_stats to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.wrong_book to authenticated;
grant select, insert, delete on public.exam_attempts to authenticated;
grant select, insert, update, delete on public.user_settings to authenticated;
grant select, insert on public.local_imports to authenticated;
grant select, insert on public.answer_operations to authenticated;
grant usage, select on sequence public.exam_attempts_id_seq to authenticated;

create or replace function public.record_answer(
  p_operation_id uuid,
  p_question_id text,
  p_subject text,
  p_choice text,
  p_correct boolean
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_inserted integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;
  if p_question_id is null or length(p_question_id) = 0 then
    raise exception 'question id is required';
  end if;
  if p_subject not in ('law', 'investment', 'finance') then
    raise exception 'invalid subject';
  end if;
  if p_choice not in ('A', 'B', 'C', 'D') then
    raise exception 'invalid choice';
  end if;

  insert into public.answer_operations (user_id, operation_id)
  values (v_user_id, p_operation_id)
  on conflict (user_id, operation_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  insert into public.question_progress as current_progress (
    user_id,
    question_id,
    answered_count,
    last_choice,
    last_correct,
    updated_at
  )
  values (v_user_id, p_question_id, 1, p_choice, p_correct, now())
  on conflict (user_id, question_id) do update
  set answered_count = current_progress.answered_count + 1,
      last_choice = excluded.last_choice,
      last_correct = excluded.last_correct,
      updated_at = now();

  insert into public.subject_stats as current_stats (
    user_id,
    subject,
    done_count,
    correct_count,
    updated_at
  )
  values (
    v_user_id,
    p_subject,
    1,
    case when p_correct then 1 else 0 end,
    now()
  )
  on conflict (user_id, subject) do update
  set done_count = current_stats.done_count + 1,
      correct_count = current_stats.correct_count + excluded.correct_count,
      updated_at = now();

  if p_correct then
    delete from public.wrong_book
    where user_id = v_user_id and question_id = p_question_id;
  else
    insert into public.wrong_book as current_wrong (user_id, question_id, updated_at)
    values (v_user_id, p_question_id, now())
    on conflict (user_id, question_id) do update
    set updated_at = excluded.updated_at;
  end if;

  return true;
end;
$$;

create or replace function public.record_exam(
  p_operation_id uuid,
  p_completed_at timestamptz,
  p_score integer,
  p_total integer
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_inserted integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;
  if p_operation_id is null then
    raise exception 'operation id is required';
  end if;
  if p_completed_at is null then
    raise exception 'completion time is required';
  end if;
  if p_total is null or p_total <= 0 or p_total > 1000 then
    raise exception 'invalid total';
  end if;
  if p_score is null or p_score < 0 or p_score > p_total then
    raise exception 'invalid score';
  end if;

  insert into public.answer_operations (user_id, operation_id)
  values (v_user_id, p_operation_id)
  on conflict (user_id, operation_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  insert into public.exam_attempts (
    user_id,
    source_key,
    completed_at,
    score,
    total
  )
  values (
    v_user_id,
    concat('web:', p_operation_id::text),
    p_completed_at,
    p_score,
    p_total
  );

  return true;
end;
$$;

create or replace function public.import_local_progress(
  p_client_id uuid,
  p_payload jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_inserted integer;
  v_question record;
  v_answered_count bigint;
  v_choice text;
  v_correct boolean;
  v_exam record;
  v_completed_at timestamptz;
  v_score integer;
  v_total integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;
  if p_client_id is null then
    raise exception 'client id is required';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'progress payload must be an object';
  end if;

  insert into public.local_imports (user_id, client_id)
  values (v_user_id, p_client_id)
  on conflict (user_id, client_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  for v_question in
    select key as question_id, value as progress
    from jsonb_each(coalesce(p_payload -> 'progress', '{}'::jsonb))
  loop
    v_answered_count := least(
      greatest(coalesce((v_question.progress ->> 'answeredCount')::bigint, 0), 0),
      1000000000
    );
    v_choice := nullif(v_question.progress ->> 'lastChoice', '');
    if v_choice is not null and v_choice not in ('A', 'B', 'C', 'D') then
      v_choice := null;
    end if;
    v_correct := coalesce((v_question.progress ->> 'correct')::boolean, false);

    insert into public.question_progress as cloud_progress (
      user_id,
      question_id,
      answered_count,
      last_choice,
      last_correct,
      updated_at
    )
    values (
      v_user_id,
      v_question.question_id,
      v_answered_count,
      v_choice,
      v_correct,
      now()
    )
    on conflict (user_id, question_id) do update
    set answered_count = cloud_progress.answered_count + excluded.answered_count;
  end loop;

  with imported_stats as (
    select
      candidate.subject,
      least(
        greatest(
          coalesce(
            (p_payload #>> array['stats', 'perSubject', candidate.subject, 'done'])::bigint,
            0
          ),
          0
        ),
        1000000000
      ) as done_count,
      least(
        greatest(
          coalesce(
            (p_payload #>> array['stats', 'perSubject', candidate.subject, 'correct'])::bigint,
            0
          ),
          0
        ),
        1000000000
      ) as correct_count
    from (values ('law'), ('investment'), ('finance')) as candidate (subject)
  )
  insert into public.subject_stats as cloud_stats (
    user_id,
    subject,
    done_count,
    correct_count,
    updated_at
  )
  select
    v_user_id,
    subject,
    done_count,
    least(correct_count, done_count),
    now()
  from imported_stats
  on conflict (user_id, subject) do update
  set done_count = cloud_stats.done_count + excluded.done_count,
      correct_count = cloud_stats.correct_count + excluded.correct_count,
      updated_at = now();

  insert into public.favorites (user_id, question_id)
  select v_user_id, imported.question_id
  from jsonb_array_elements_text(
    coalesce(p_payload -> 'favorites', '[]'::jsonb)
  ) as imported (question_id)
  where length(imported.question_id) > 0
  on conflict (user_id, question_id) do nothing;

  insert into public.wrong_book (user_id, question_id, updated_at)
  select v_user_id, imported.question_id, now()
  from jsonb_array_elements_text(
    coalesce(p_payload -> 'wrongBook', '[]'::jsonb)
  ) as imported (question_id)
  left join public.question_progress as cloud_progress
    on cloud_progress.user_id = v_user_id
   and cloud_progress.question_id = imported.question_id
  where length(imported.question_id) > 0
    and coalesce(cloud_progress.last_correct, false) = false
  on conflict (user_id, question_id) do update
  set updated_at = excluded.updated_at;

  for v_exam in
    select value as attempt, ordinality as attempt_number
    from jsonb_array_elements(
      coalesce(p_payload -> 'examHistory', '[]'::jsonb)
    ) with ordinality
  loop
    begin
      v_completed_at := (v_exam.attempt ->> 'date')::timestamptz;
    exception when others then
      v_completed_at := now();
    end;
    v_total := least(
      greatest(coalesce((v_exam.attempt ->> 'total')::integer, 1), 1),
      1000
    );
    v_score := least(
      greatest(coalesce((v_exam.attempt ->> 'score')::integer, 0), 0),
      v_total
    );

    insert into public.exam_attempts (
      user_id,
      source_key,
      completed_at,
      score,
      total
    )
    values (
      v_user_id,
      concat('legacy:', p_client_id::text, ':', v_exam.attempt_number::text),
      v_completed_at,
      v_score,
      v_total
    )
    on conflict (user_id, source_key) do nothing;
  end loop;

  insert into public.user_settings (
    user_id,
    per_round_count,
    exam_timer_min,
    dark_mode,
    updated_at
  )
  values (
    v_user_id,
    least(
      greatest(coalesce((p_payload #>> '{settings,perRoundCount}')::integer, 20), 1),
      200
    ),
    least(
      greatest(coalesce((p_payload #>> '{settings,examTimerMin}')::integer, 60), 1),
      240
    ),
    coalesce((p_payload #>> '{settings,darkMode}')::boolean, false),
    now()
  )
  on conflict (user_id) do nothing;

  return true;
end;
$$;

create or replace function public.clear_learning_progress(
  p_operation_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_inserted integer;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;
  if p_operation_id is null then
    raise exception 'operation id is required';
  end if;

  insert into public.answer_operations (user_id, operation_id)
  values (v_user_id, p_operation_id)
  on conflict (user_id, operation_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  delete from public.question_progress where user_id = v_user_id;
  delete from public.subject_stats where user_id = v_user_id;
  delete from public.favorites where user_id = v_user_id;
  delete from public.wrong_book where user_id = v_user_id;
  delete from public.exam_attempts where user_id = v_user_id;
  delete from public.user_settings where user_id = v_user_id;

  return true;
end;
$$;

revoke execute on function public.record_answer(uuid, text, text, text, boolean)
  from public, anon;
revoke execute on function public.record_exam(uuid, timestamptz, integer, integer)
  from public, anon;
revoke execute on function public.import_local_progress(uuid, jsonb)
  from public, anon;
revoke execute on function public.clear_learning_progress(uuid)
  from public, anon;

grant execute on function public.record_answer(uuid, text, text, text, boolean)
  to authenticated;
grant execute on function public.record_exam(uuid, timestamptz, integer, integer)
  to authenticated;
grant execute on function public.import_local_progress(uuid, jsonb)
  to authenticated;
grant execute on function public.clear_learning_progress(uuid)
  to authenticated;
