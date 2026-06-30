from scripts import config

def test_subjects_have_three_codes():
    assert set(config.SUBJECTS) == {"law", "investment", "finance"}

def test_subject_from_text_uses_bracket_marker():
    assert config.subject_from_text('專業科目：證券投資與財務分析－試卷「投資學」') == "investment"
    assert config.subject_from_text('專業科目：證券投資與財務分析－試卷「財務分析」') == "finance"
    assert config.subject_from_text('專業科目：證券交易相關法規與實務') == "law"

def test_subject_from_text_returns_none_when_unknown():
    assert config.subject_from_text('其他文字') is None

def test_paths_are_under_project_root():
    assert config.DATA_DIR.name == "data"
    assert config.FIGURES_DIR.parent == config.DATA_DIR
