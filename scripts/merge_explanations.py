"""合併詳解批次 _out.json → data/explanations.json（階段 2）。

掃描 data/_explain_work/batch_*_out.json，依 questions.json 的題目順序
彙整所有詳解，寫入 data/explanations.json。

- 以 id 對應；重複 id 以較晚（檔名排序較後）批次覆蓋。
- 校驗：explanation 非空；id 必須存在於題庫；回報缺漏/多餘。
- flagged 為 true 者保留 flag_note 供人工複核。

用法：python3 -m scripts.merge_explanations
"""
import glob
import json
from pathlib import Path

from scripts import config

WORK_DIR = config.DATA_DIR / "_explain_work"
OUT_PATH = config.DATA_DIR / "explanations.json"


def load_out_files(work_dir: Path) -> dict:
    """讀所有 *_out.json，回 {id: entry}（後蓋前）。"""
    merged: dict = {}
    for f in sorted(glob.glob(str(work_dir / "batch_*_out.json"))):
        data = json.loads(Path(f).read_text(encoding="utf-8"))
        for e in data:
            eid = e["id"]
            exp = (e.get("explanation") or "").strip()
            if not exp:
                raise ValueError(f"{Path(f).name}: id={eid} explanation 為空")
            entry = {"id": eid, "explanation": e["explanation"], "flagged": bool(e.get("flagged"))}
            if entry["flagged"] and e.get("flag_note"):
                entry["flag_note"] = e["flag_note"]
            merged[eid] = entry
    return merged


def build_explanations(questions: list, merged: dict) -> list:
    """依題庫順序輸出已具備詳解的題目。"""
    valid_ids = {q["id"] for q in questions}
    unknown = [eid for eid in merged if eid not in valid_ids]
    if unknown:
        raise ValueError(f"詳解含題庫外 id：{unknown[:5]}（共 {len(unknown)}）")
    return [merged[q["id"]] for q in questions if q["id"] in merged]


def main() -> None:
    questions = json.loads((config.DATA_DIR / "questions.json").read_text(encoding="utf-8"))
    merged = load_out_files(WORK_DIR)
    explanations = build_explanations(questions, merged)
    OUT_PATH.write_text(
        json.dumps(explanations, ensure_ascii=False),
        encoding="utf-8",
    )
    flagged = [e["id"] for e in explanations if e.get("flagged")]
    print(f"merged {len(explanations)}/{len(questions)} explanations")
    print(f"flagged {len(flagged)}: {flagged[:20]}")


if __name__ == "__main__":
    main()
