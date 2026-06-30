import json
from pathlib import Path
from scripts import bigzip, classify, build, validate

def run(zip_dir, raw_dir, data_dir) -> dict:
    zip_dir, raw_dir, data_dir = Path(zip_dir), Path(raw_dir), Path(data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)
    zips = sorted(zip_dir.glob("1*.zip"))
    pdfs = bigzip.extract_all(zips, raw_dir)
    manifest = classify.build_manifest(pdfs, data_dir / "manifest.json")
    questions = build.build_questions(manifest, raw_dir, data_dir / "questions.json")
    reviews = validate.validate_questions(questions)
    validate.write_review(reviews, data_dir / "review-needed.json")
    report = validate.count_report(questions)
    report["review_count"] = len(reviews)
    (data_dir / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2))
    return report

if __name__ == "__main__":
    from scripts import config
    print(json.dumps(run(config.ZIP_DIR, config.RAW_DIR, config.DATA_DIR),
                     ensure_ascii=False, indent=2))
