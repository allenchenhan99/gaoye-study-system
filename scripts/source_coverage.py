import json
import re
from collections import Counter
from pathlib import Path


_ARCHIVE_YEAR_RE = re.compile(r"^(\d{3})")


def load_contract(path) -> dict:
    contract_path = Path(path)
    if not contract_path.is_file():
        raise RuntimeError(
            f"Source coverage contract is missing: {contract_path}; "
            "canonical dataset was not published"
        )
    contract = json.loads(contract_path.read_text(encoding="utf-8"))
    if contract.get("schemaVersion") != 1:
        raise RuntimeError(
            "Unsupported source coverage contract schema; "
            "canonical dataset was not published"
        )
    return contract


def _expected_source_groups(contract: dict) -> dict[tuple[int, int], dict]:
    groups = {}
    for batch in contract.get("sourceBatches", []):
        for year in batch.get("years", []):
            for round_number in batch.get("rounds", []):
                key = (year, round_number)
                if key in groups:
                    raise RuntimeError(
                        f"Duplicate exam group in source coverage contract: {key}"
                    )
                groups[key] = {
                    "question": batch.get("questionPdfsPerRound"),
                    "answer": batch.get("answerPdfsPerRound"),
                }
    if not groups:
        raise RuntimeError("Source coverage contract contains no exam groups")
    return groups


def assert_archive_coverage(zip_paths, contract: dict) -> None:
    expected = Counter(contract.get("archiveYears", []))
    actual = Counter()
    invalid_names = []
    for path in zip_paths:
        match = _ARCHIVE_YEAR_RE.match(Path(path).name)
        if match is None:
            invalid_names.append(Path(path).name)
        else:
            actual[int(match.group(1))] += 1

    if invalid_names or actual != expected:
        raise RuntimeError(
            "Source archive coverage mismatch: "
            f"expected {dict(sorted(expected.items()))}, "
            f"received {dict(sorted(actual.items()))}; "
            "canonical dataset was not published"
        )


def assert_pdf_coverage(manifest, contract: dict) -> None:
    expected_groups = _expected_source_groups(contract)
    expected = Counter()
    for (year, round_number), counts in expected_groups.items():
        for kind in ("question", "answer"):
            count = counts[kind]
            if type(count) is not int or count < 0:
                raise RuntimeError(
                    "Source coverage contract contains an invalid PDF count"
                )
            if count:
                expected[(year, round_number, kind)] = count

    actual = Counter()
    for entry in manifest:
        if entry.get("is_question_file") and not entry.get("is_answer_file"):
            kind = "question"
        elif entry.get("is_answer_file") and not entry.get("is_question_file"):
            kind = "answer"
        else:
            kind = "invalid"
        actual[(entry.get("year"), entry.get("round"), kind)] += 1

    if actual != expected:
        raise RuntimeError(
            "PDF coverage mismatch against data/source-coverage.json; "
            "canonical dataset was not published"
        )


def assert_question_coverage(questions, contract: dict) -> None:
    source_groups = _expected_source_groups(contract)
    subjects = contract.get("subjects", [])
    questions_per_subject = contract.get("questionsPerSubject")
    if (not subjects
            or len(subjects) != len(set(subjects))
            or type(questions_per_subject) is not int
            or questions_per_subject <= 0):
        raise RuntimeError(
            "Source coverage contract contains an invalid question distribution"
        )
    expected = Counter({
        (year, round_number, subject): questions_per_subject
        for year, round_number in source_groups
        for subject in subjects
    })
    expected_total = sum(expected.values())
    if expected_total != contract.get("expectedQuestionCount"):
        raise RuntimeError(
            "Question coverage contract has an inconsistent expected total; "
            "canonical dataset was not published"
        )

    actual = Counter(
        (question.get("year"), question.get("round"), question.get("subject"))
        for question in questions
    )
    if actual != expected or len(questions) != expected_total:
        raise RuntimeError(
            "Question coverage mismatch against data/source-coverage.json; "
            "canonical dataset was not published"
        )


def assert_no_shrink(questions, canonical_path) -> None:
    path = Path(canonical_path)
    if not path.is_file():
        return
    existing = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(existing, list):
        raise RuntimeError(
            "Existing canonical dataset is not a JSON list; "
            "canonical dataset was not published"
        )
    if len(questions) < len(existing):
        raise RuntimeError(
            f"Dataset shrink blocked: {len(existing)} -> {len(questions)} questions; "
            "canonical dataset was not published"
        )
