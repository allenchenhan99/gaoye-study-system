import zipfile
from pathlib import Path

def decode_name(name: str) -> str:
    try:
        return name.encode("cp437").decode("big5")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return name

def extract_all(zip_paths, raw_dir: Path) -> list[Path]:
    raw_dir = Path(raw_dir)
    out: list[Path] = []
    for zp in zip_paths:
        with zipfile.ZipFile(zp) as z:
            for info in z.infolist():
                if info.is_dir():
                    continue
                name = decode_name(info.filename)
                if not name.lower().endswith(".pdf"):
                    continue
                dest = raw_dir / name
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(z.read(info))
                out.append(dest)
    return sorted(out)
