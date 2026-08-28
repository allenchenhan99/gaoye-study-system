import json
from pathlib import Path
from scripts import bigzip, classify, build, publish_dataset, source_coverage, validate

def run(zip_dir, raw_dir, data_dir) -> dict:
    zip_dir, raw_dir, data_dir = Path(zip_dir), Path(raw_dir), Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)
    zips = sorted(zip_dir.glob("1*.zip"))
    if not zips:
        raise RuntimeError(
            f"No source ZIP archives found in {zip_dir} (expected 1*.zip); "
            "canonical dataset was not published"
        )

    coverage_contract = source_coverage.load_contract(
        data_dir / "source-coverage.json")
    source_coverage.assert_archive_coverage(zips, coverage_contract)

    pdfs = bigzip.extract_all(zips, raw_dir)
    if not pdfs:
        raise RuntimeError(
            "No PDF files were extracted from the source ZIP archives; "
            "canonical dataset was not published"
        )

    manifest = classify.build_manifest(pdfs, data_dir / "manifest.json")
    source_coverage.assert_pdf_coverage(manifest, coverage_contract)
    intermediate_dir = data_dir / "_pipeline"
    questions = build.build_questions(
        manifest,
        raw_dir,
        intermediate_dir / "questions.json",
        manual_dir=data_dir,
    )
    reviews = validate.validate_questions(questions)
    validate.write_review(reviews, data_dir / "review-needed.json")
    report = validate.count_report(questions)
    report["review_count"] = len(reviews)
    (data_dir / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2))

    if not questions:
        raise RuntimeError(
            "Pipeline produced zero questions; canonical dataset was not published"
        )

    seen_ids = set()
    duplicate_ids = set()
    for question in questions:
        question_id = question.get("id")
        if question_id in seen_ids:
            duplicate_ids.add(question_id)
        seen_ids.add(question_id)
    if duplicate_ids:
        preview = ", ".join(
            str(question_id)
            for question_id in sorted(duplicate_ids, key=str)[:5])
        raise RuntimeError(
            f"Pipeline produced duplicate question IDs ({preview}); "
            "canonical dataset was not published"
        )

    if reviews:
        raise RuntimeError(
            f"Question validation failed for {len(reviews)} question(s); "
            "canonical dataset was not published"
        )

    source_coverage.assert_question_coverage(questions, coverage_contract)
    canonical_path = data_dir / "questions.json"
    source_coverage.assert_no_shrink(questions, canonical_path)

    staged_release = intermediate_dir / "published-questions.json"
    publish_dataset.export_questions(questions, staged_release)
    staged_release.replace(canonical_path)
    return report

if __name__ == "__main__":
    from scripts import config
    print(json.dumps(run(config.ZIP_DIR, config.RAW_DIR, config.DATA_DIR),
                     ensure_ascii=False, indent=2))
