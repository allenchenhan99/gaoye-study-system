from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


def migration_sql() -> str:
    migrations = list(
        (REPO_ROOT / "supabase" / "migrations").glob(
            "*_create_user_learning_progress.sql"
        )
    )
    assert len(migrations) == 1
    return migrations[0].read_text(encoding="utf-8").lower()


def test_learning_progress_migration_creates_required_tables():
    sql = migration_sql()

    for table in (
        "question_progress",
        "subject_stats",
        "favorites",
        "wrong_book",
        "exam_attempts",
        "user_settings",
        "local_imports",
        "answer_operations",
    ):
        assert f"create table public.{table}" in sql


def test_learning_progress_migration_enables_owner_scoped_rls():
    sql = migration_sql()

    assert sql.count("enable row level security") >= 8
    assert "to authenticated" in sql
    assert "(select auth.uid()) = user_id" in sql
    assert "to anon" not in sql


def test_learning_progress_functions_are_invoker_scoped():
    sql = migration_sql()

    for function in (
        "record_answer",
        "record_exam",
        "import_local_progress",
        "clear_learning_progress",
    ):
        assert f"function public.{function}" in sql

    assert sql.count("security invoker") >= 4
    assert "revoke execute on function" in sql
    assert "grant execute on function" in sql


def test_retryable_mutations_are_idempotent_in_postgres():
    sql = migration_sql()

    assert sql.count("insert into public.answer_operations") >= 3
    assert "function public.record_exam(" in sql
    assert "function public.clear_learning_progress(\n  p_operation_id uuid" in sql
    assert "record_exam(uuid, timestamptz, integer, integer)" in sql
    assert "clear_learning_progress(uuid)" in sql
