import zipfile
from pathlib import Path
from scripts import bigzip

def test_decode_name_recovers_big5():
    original = "105/105Q2高業投資學.pdf"
    mojibake = original.encode("big5").decode("cp437")  # 模擬 zip 內存法
    assert bigzip.decode_name(mojibake) == original

def test_decode_name_passthrough_for_ascii():
    assert bigzip.decode_name("114/11401.pdf") == "114/11401.pdf"

def test_extract_all_writes_pdfs_and_returns_paths(tmp_path):
    # 造一個內含 big5 檔名 PDF 的 zip
    zpath = tmp_path / "105-test.zip"
    inner = "105/測試卷.pdf".encode("big5").decode("cp437")
    with zipfile.ZipFile(zpath, "w") as z:
        z.writestr(inner, b"%PDF-1.4 dummy")
    raw = tmp_path / "raw"
    out = bigzip.extract_all([zpath], raw)
    assert len(out) == 1
    assert out[0].name == "測試卷.pdf"
    assert out[0].parent.name == "105"
    assert out[0].read_bytes() == b"%PDF-1.4 dummy"
