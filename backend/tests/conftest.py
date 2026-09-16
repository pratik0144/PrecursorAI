import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.fixture
def mock_llm_provider(mocker):
    return mocker.patch("app.ai.gemini.GeminiProvider")

@pytest.fixture
def sample_report_data():
    return {
        "title": "Dropped Object near wellhead",
        "description": "A wrench was dropped from 20m high.",
        "location": "Rig 1",
        "reporter_id": "user1"
    }
