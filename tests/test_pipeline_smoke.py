import json
from pathlib import Path
import pytest
from scripts import run_pipeline, build, bigzip, classify


def _write_source_contract(
        data, *, archive_years=(114,), years=(114,), rounds=(1,),
        subjects=("law",), questions_per_subject=1,
        question_pdfs=1, answer_pdfs=0):
    data.mkdir(parents=True, exist_ok=True)
    contract = {
        "schemaVersion": 1,
        "archiveYears": list(archive_years),
        "subjects": list(subjects),
        "questionsPerSubject": questions_per_subject,
        "expectedQuestionCount": (
            len(years) * len(rounds) * len(subjects) * questions_per_subject
        ),
        "sourceBatches": [{
            "years": list(years),
            "rounds": list(rounds),
            "questionPdfsPerRound": question_pdfs,
            "answerPdfsPerRound": answer_pdfs,
        }],
    }
    (data / "source-coverage.json").write_text(
        json.dumps(contract), encoding="utf-8")


def test_run_writes_outputs(tmp_path, monkeypatch):
    data = tmp_path / "data"
    _write_source_contract(data)
    (tmp_path / "114.zip").write_bytes(b"placeholder")
    # 假造 manifest 與題庫，攔截實際 PDF 讀取
    monkeypatch.setattr(bigzip, "extract_all", lambda zips, raw: [raw / "11401.pdf"])
    monkeypatch.setattr(classify, "build_manifest",
        lambda paths, out: [{"source": "x", "year": 114, "round": 1,
                             "era": "new", "is_answer_file": False,
                             "is_question_file": True}])
    fake_qs = [{"id": "114-1-law-001", "year": 114, "round": 1,
                "roundLabel": "第1次", "subject": "law",
                "subjectLabel": "證券交易相關法規與實務",
                "number": 1, "stem": "q", "answer": "A",
                "options": {"A":"1","B":"2","C":"3","D":"4"}, "source": "x"}]
    def mock_build_questions(m, raw, out, manual_dir=None):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        Path(out).write_text(json.dumps(fake_qs, ensure_ascii=False, indent=2))
        return fake_qs
    monkeypatch.setattr(build, "build_questions", mock_build_questions)
    rep = run_pipeline.run(tmp_path, tmp_path/"raw", data)
    assert (data / "questions.json").exists()
    assert (data / "_pipeline" / "questions.json").exists()
    assert (data / "review-needed.json").exists()
    assert rep["total"] == 1 and rep["review_count"] == 0


def test_run_without_source_archives_preserves_canonical_dataset(tmp_path):
    data = tmp_path / "data"
    data.mkdir()
    canonical = data / "questions.json"
    original = b'[{"id":"existing-release"}]'
    canonical.write_bytes(original)

    with pytest.raises(RuntimeError, match="source ZIP"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original


def test_run_without_extracted_pdfs_preserves_canonical_dataset(
        tmp_path, monkeypatch):
    data = tmp_path / "data"
    data.mkdir()
    canonical = data / "questions.json"
    original = b'[{"id":"existing-release"}]'
    canonical.write_bytes(original)
    _write_source_contract(data)
    (tmp_path / "114.zip").write_bytes(b"placeholder")
    monkeypatch.setattr(bigzip, "extract_all", lambda zips, raw: [])

    with pytest.raises(RuntimeError, match="No PDF"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original


def test_run_with_zero_questions_preserves_canonical_dataset(
        tmp_path, monkeypatch):
    data = tmp_path / "data"
    data.mkdir()
    canonical = data / "questions.json"
    original = b'[{"id":"existing-release"}]'
    canonical.write_bytes(original)
    _write_source_contract(data)
    (tmp_path / "114.zip").write_bytes(b"placeholder")

    monkeypatch.setattr(
        bigzip, "extract_all", lambda zips, raw: [raw / "11401.pdf"])
    monkeypatch.setattr(
        classify, "build_manifest",
        lambda paths, out: [{"source": "x", "year": 114, "round": 1,
                             "era": "new", "is_answer_file": False,
                             "is_question_file": True}],
    )

    def mock_build_questions(manifest, raw, out, manual_dir=None):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        Path(out).write_text("[]", encoding="utf-8")
        return []

    monkeypatch.setattr(build, "build_questions", mock_build_questions)

    with pytest.raises(RuntimeError, match="zero questions"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original


def test_run_with_invalid_questions_preserves_canonical_dataset(
        tmp_path, monkeypatch):
    data = tmp_path / "data"
    data.mkdir()
    canonical = data / "questions.json"
    original = b'[{"id":"existing-release"}]'
    canonical.write_bytes(original)
    _write_source_contract(data)
    (tmp_path / "114.zip").write_bytes(b"placeholder")

    monkeypatch.setattr(
        bigzip, "extract_all", lambda zips, raw: [raw / "11401.pdf"])
    monkeypatch.setattr(
        classify, "build_manifest",
        lambda paths, out: [{"source": "x", "year": 114, "round": 1,
                             "era": "new", "is_answer_file": False,
                             "is_question_file": True}],
    )
    invalid = [{"id": "114-1-law-001", "year": 114, "round": 1,
                "roundLabel": "第1次", "subject": "law",
                "subjectLabel": "證券交易相關法規與實務",
                "number": 1, "stem": "", "answer": "A",
                "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
                "source": "x"}]

    def mock_build_questions(manifest, raw, out, manual_dir=None):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        Path(out).write_text(json.dumps(invalid), encoding="utf-8")
        return invalid

    monkeypatch.setattr(build, "build_questions", mock_build_questions)

    with pytest.raises(RuntimeError, match="validation"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original


def test_run_with_duplicate_ids_preserves_canonical_dataset(
        tmp_path, monkeypatch):
    data = tmp_path / "data"
    data.mkdir()
    canonical = data / "questions.json"
    original = b'[{"id":"existing-release"}]'
    canonical.write_bytes(original)
    _write_source_contract(data)
    (tmp_path / "114.zip").write_bytes(b"placeholder")

    monkeypatch.setattr(
        bigzip, "extract_all", lambda zips, raw: [raw / "11401.pdf"])
    monkeypatch.setattr(
        classify, "build_manifest",
        lambda paths, out: [{"source": "x", "year": 114, "round": 1,
                             "era": "new", "is_answer_file": False,
                             "is_question_file": True}],
    )
    question = {"id": "114-1-law-001", "year": 114, "round": 1,
                "roundLabel": "第1次", "subject": "law",
                "subjectLabel": "證券交易相關法規與實務",
                "number": 1, "stem": "題幹", "answer": "A",
                "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
                "source": "x"}

    def mock_build_questions(manifest, raw, out, manual_dir=None):
        questions = [question.copy(), question.copy()]
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        Path(out).write_text(json.dumps(questions), encoding="utf-8")
        return questions

    monkeypatch.setattr(build, "build_questions", mock_build_questions)

    with pytest.raises(RuntimeError, match="duplicate"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original


def test_run_with_partial_archive_set_preserves_canonical_dataset(
        tmp_path):
    data = tmp_path / "data"
    _write_source_contract(
        data, archive_years=(113, 114), years=(113, 114))
    canonical = data / "questions.json"
    original = b'[{"id":"existing-release"}]'
    canonical.write_bytes(original)
    (tmp_path / "114.zip").write_bytes(b"placeholder")

    with pytest.raises(RuntimeError, match="archive coverage"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original


def test_run_with_partial_pdf_inventory_preserves_canonical_dataset(
        tmp_path, monkeypatch):
    data = tmp_path / "data"
    _write_source_contract(data, question_pdfs=2)
    canonical = data / "questions.json"
    original = b'[{"id":"existing-release"}]'
    canonical.write_bytes(original)
    (tmp_path / "114.zip").write_bytes(b"placeholder")

    monkeypatch.setattr(
        bigzip, "extract_all", lambda zips, raw: [raw / "11401.pdf"])
    monkeypatch.setattr(
        classify, "build_manifest",
        lambda paths, out: [{"source": "x", "year": 114, "round": 1,
                             "era": "new", "is_answer_file": False,
                             "is_question_file": True}],
    )

    with pytest.raises(RuntimeError, match="PDF coverage"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original


def test_run_with_partial_question_distribution_preserves_canonical_dataset(
        tmp_path, monkeypatch):
    data = tmp_path / "data"
    _write_source_contract(data, subjects=("law", "investment"))
    canonical = data / "questions.json"
    original = b'[{"id":"existing-release"}]'
    canonical.write_bytes(original)
    (tmp_path / "114.zip").write_bytes(b"placeholder")

    monkeypatch.setattr(
        bigzip, "extract_all", lambda zips, raw: [raw / "11401.pdf"])
    monkeypatch.setattr(
        classify, "build_manifest",
        lambda paths, out: [{"source": "x", "year": 114, "round": 1,
                             "era": "new", "is_answer_file": False,
                             "is_question_file": True}],
    )
    questions = [{"id": "114-1-law-001", "year": 114, "round": 1,
                  "roundLabel": "第1次", "subject": "law",
                  "subjectLabel": "證券交易相關法規與實務",
                  "number": 1, "stem": "題幹", "answer": "A",
                  "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
                  "source": "x"}]

    def mock_build_questions(manifest, raw, out, manual_dir=None):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        Path(out).write_text(json.dumps(questions), encoding="utf-8")
        return questions

    monkeypatch.setattr(build, "build_questions", mock_build_questions)

    with pytest.raises(RuntimeError, match="Question coverage"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original


def test_run_cannot_shrink_existing_canonical_dataset(tmp_path, monkeypatch):
    data = tmp_path / "data"
    _write_source_contract(data)
    canonical = data / "questions.json"
    original = b'[{"id":"old-1"},{"id":"old-2"}]'
    canonical.write_bytes(original)
    (tmp_path / "114.zip").write_bytes(b"placeholder")

    monkeypatch.setattr(
        bigzip, "extract_all", lambda zips, raw: [raw / "11401.pdf"])
    monkeypatch.setattr(
        classify, "build_manifest",
        lambda paths, out: [{"source": "x", "year": 114, "round": 1,
                             "era": "new", "is_answer_file": False,
                             "is_question_file": True}],
    )
    question = {"id": "114-1-law-001", "year": 114, "round": 1,
                "roundLabel": "第1次", "subject": "law",
                "subjectLabel": "證券交易相關法規與實務",
                "number": 1, "stem": "題幹", "answer": "A",
                "options": {"A": "1", "B": "2", "C": "3", "D": "4"},
                "source": "x"}

    def mock_build_questions(manifest, raw, out, manual_dir=None):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        Path(out).write_text(json.dumps([question]), encoding="utf-8")
        return [question]

    monkeypatch.setattr(build, "build_questions", mock_build_questions)

    with pytest.raises(RuntimeError, match="shrink"):
        run_pipeline.run(tmp_path, tmp_path / "raw", data)

    assert canonical.read_bytes() == original
