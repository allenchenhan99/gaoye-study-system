import json
from pathlib import Path
from scripts import validate


ROOT = Path(__file__).resolve().parents[1]
QUESTIONS_PATH = ROOT / "data" / "questions.json"
EXPLANATIONS_PATH = ROOT / "data" / "explanations.json"
COVERAGE_PATH = ROOT / "data" / "source-coverage.json"
LEGACY_PUBLIC_DATA = ROOT / "frontend" / "public" / "data"


def _load_list(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    assert isinstance(data, list) and data, f"{path} must contain a non-empty JSON list"
    return data


def test_canonical_dataset_is_tracked_outside_the_frontend():
    assert QUESTIONS_PATH.is_file()
    assert EXPLANATIONS_PATH.is_file()
    assert COVERAGE_PATH.is_file()
    assert not LEGACY_PUBLIC_DATA.exists()


def test_canonical_questions_match_explanations_one_to_one():
    questions = _load_list(QUESTIONS_PATH)
    explanations = _load_list(EXPLANATIONS_PATH)
    coverage = json.loads(COVERAGE_PATH.read_text(encoding="utf-8"))

    question_ids = [question["id"] for question in questions]
    explanation_ids = [explanation["id"] for explanation in explanations]

    assert len(questions) == coverage["expectedQuestionCount"]
    assert len(question_ids) == len(set(question_ids))
    assert len(explanation_ids) == len(set(explanation_ids))
    assert set(question_ids) == set(explanation_ids)


def test_canonical_questions_follow_the_browser_contract():
    required = {
        "id", "year", "round", "roundLabel", "subject", "subjectLabel",
        "number", "stem", "options", "answer",
    }

    questions = _load_list(QUESTIONS_PATH)
    assert validate.validate_questions(questions) == []

    for question in questions:
        assert required <= question.keys(), question.get("id")
        assert isinstance(question["id"], str)
        assert isinstance(question["year"], int)
        assert isinstance(question["round"], int)
        assert isinstance(question["roundLabel"], str) and question["roundLabel"].strip()
        assert question["subject"] in {"law", "investment", "finance"}
        assert isinstance(question["subjectLabel"], str) and question["subjectLabel"].strip()
        assert isinstance(question["number"], int)
        assert isinstance(question["stem"], str) and question["stem"].strip()
        assert isinstance(question["options"], dict)
        assert set(question["options"]) == {"A", "B", "C", "D"}, question["id"]
        assert all(isinstance(value, str) and value.strip()
                   for value in question["options"].values()), question["id"]
        assert question["answer"] in {"A", "B", "C", "D"} or (
            question["answer"] is None and question.get("allCredit") is True
        ), question["id"]
        if "allCredit" in question:
            assert isinstance(question["allCredit"], bool)


def test_canonical_explanations_follow_the_browser_contract():
    for explanation in _load_list(EXPLANATIONS_PATH):
        assert isinstance(explanation.get("id"), str) and explanation["id"]
        assert isinstance(explanation.get("explanation"), str)
        assert explanation["explanation"].strip()
        assert isinstance(explanation.get("flagged"), bool)
        if "flag_note" in explanation:
            assert isinstance(explanation["flag_note"], str)
