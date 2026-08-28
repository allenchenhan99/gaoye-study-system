begin;

set local role postgres;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;

select plan(18);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'user-a@example.test',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'user-b@example.test',
    now(),
    now()
  );

insert into public.favorites (user_id, question_id)
values ('22222222-2222-4222-8222-222222222222', 'question-b');

select ok(
  not has_table_privilege('anon', 'public.favorites', 'select'),
  'anonymous users cannot select personal progress'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.record_answer(uuid,text,text,text,boolean)',
    'execute'
  ),
  'anonymous users cannot execute progress RPCs'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

select lives_ok(
  $$insert into public.favorites (user_id, question_id)
    values ('11111111-1111-4111-8111-111111111111', 'question-a')$$,
  'a signed-in user can insert their own favorite'
);
select is(
  (select count(*) from public.favorites),
  1::bigint,
  'RLS hides another user''s favorites'
);
select throws_like(
  $$insert into public.favorites (user_id, question_id)
    values ('22222222-2222-4222-8222-222222222222', 'forged-by-a')$$,
  '%row-level security%',
  'RLS rejects writes for another user'
);

select is(
  public.record_answer(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'question-a',
    'law',
    'A',
    false
  ),
  true,
  'record_answer accepts a new operation'
);
select is(
  public.record_answer(
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'question-a',
    'law',
    'A',
    false
  ),
  false,
  'record_answer ignores a retried operation'
);
select is(
  (select answered_count from public.question_progress where question_id = 'question-a'),
  1::bigint,
  'an answer retry does not double-count question progress'
);
select is(
  (select done_count from public.subject_stats where subject = 'law'),
  1::bigint,
  'an answer retry does not double-count subject statistics'
);

select is(
  public.record_exam(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '2026-08-29T00:00:00Z',
    42,
    50
  ),
  true,
  'record_exam accepts a new operation'
);
select is(
  public.record_exam(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '2026-08-29T00:00:00Z',
    42,
    50
  ),
  false,
  'record_exam ignores a retried operation'
);
select is(
  (select count(*) from public.exam_attempts),
  1::bigint,
  'an exam retry creates only one attempt'
);

select is(
  public.clear_learning_progress('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  true,
  'clear_learning_progress accepts a new operation'
);
select is(
  public.clear_learning_progress('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  false,
  'clear_learning_progress ignores a retried operation'
);
select is(
  (
    (select count(*) from public.question_progress)
    + (select count(*) from public.subject_stats)
    + (select count(*) from public.favorites)
    + (select count(*) from public.wrong_book)
    + (select count(*) from public.exam_attempts)
    + (select count(*) from public.user_settings)
  ),
  0::bigint,
  'clear removes all learning records visible to the current user'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '22222222-2222-4222-8222-222222222222',
  true
);
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
  true
);

select is(
  (select array_agg(question_id order by question_id) from public.favorites),
  array['question-b']::text[],
  'the second user still sees their own untouched progress'
);
select is(
  (select count(*) from public.answer_operations),
  0::bigint,
  'operation identifiers are isolated between users'
);
select lives_ok(
  $$insert into public.favorites (user_id, question_id)
    values ('22222222-2222-4222-8222-222222222222', 'question-b-2')$$,
  'the second user can write their own progress'
);

select * from finish();
rollback;
