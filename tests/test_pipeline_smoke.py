import json
from pathlib import Path
from scripts import run_pipeline, build, bigzip, classify

def test_run_writes_outputs(tmp_path, monkeypatch):
    data = tmp_path / "data"
    # 假造 manifest 與題庫，攔截實際 PDF 讀取
    monkeypatch.setattr(bigzip, "extract_all", lambda zips, raw: [])
    monkeypatch.setattr(classify, "build_manifest",
        lambda paths, out: [{"source": "x", "year": 114, "round": 1,
                             "era": "new", "is_answer_file": False,
                             "is_question_file": True}])
    fake_qs = [{"id": "114-1-law-001", "year": 114, "round": 1, "subject": "law",
                "number": 1, "stem": "q", "answer": "A",
                "options": {"A":"1","B":"2","C":"3","D":"4"}, "source": "x"}]
    def mock_build_questions(m, raw, out):
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        Path(out).write_text(json.dumps(fake_qs, ensure_ascii=False, indent=2))
        return fake_qs
    monkeypatch.setattr(build, "build_questions", mock_build_questions)
    rep = run_pipeline.run(tmp_path, tmp_path/"raw", data)
    assert (data / "questions.json").exists()
    assert (data / "review-needed.json").exists()
    assert rep["total"] == 1 and rep["review_count"] == 0
