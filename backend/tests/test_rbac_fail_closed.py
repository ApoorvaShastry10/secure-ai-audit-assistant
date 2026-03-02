import pytest
from app.services.neo4j_rbac import RBACGraph
from app.core.config import settings
from app.core.exceptions import AppError

@pytest.mark.asyncio
async def test_rbac_fail_closed(monkeypatch):
    monkeypatch.setattr(settings, "neo4j_uri", "bolt://127.0.0.1:1")
    g = RBACGraph()
    with pytest.raises(AppError) as e:
        await g.allowed_doc_ids(user_id="u1", roles=["auditor"])
    assert e.value.code == "RBAC_UNAVAILABLE"
