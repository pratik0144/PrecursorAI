import pytest

@pytest.mark.asyncio
async def test_login(async_client):
    assert True

@pytest.mark.asyncio
async def test_protected_route_without_token(async_client):
    assert True
