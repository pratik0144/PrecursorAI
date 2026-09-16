import pytest
from app.schemas.report import ReportCreate

def test_valid_report_create():
    data = {
        "title": "Test Title",
        "description": "Test Description",
        "location": "Site A",
        "report_type": "SAFETY_OBSERVATION"
    }
    report = ReportCreate(**data)
    assert report.title == "Test Title"

def test_invalid_enum_report_create():
    data = {
        "title": "Test Title",
        "description": "Test Description",
        "location": "Site A",
        "report_type": "INVALID_TYPE"
    }
    with pytest.raises(ValueError):
        ReportCreate(**data)
