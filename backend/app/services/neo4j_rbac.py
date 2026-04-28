from typing import List
from neo4j import AsyncGraphDatabase
from cachetools import TTLCache
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from app.core.config import settings
from app.core.exceptions import AppError

_cache = TTLCache(maxsize=10_000, ttl=settings.rbac_cache_ttl_seconds)

class RBACGraph:
    def __init__(self) -> None:
        self._driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri, auth=(settings.neo4j_user, settings.neo4j_password)
        )

    async def allowed_doc_ids(self, *, user_id: str, roles: List[str]) -> List[str]:
        cache_key = f"{user_id}:{'|'.join(sorted(roles))}"
        if cache_key in _cache:
            return _cache[cache_key]
        try:
            async with self._driver.session() as session:
                cypher = '''
                MATCH (u:User {id: $user_id})-[:HAS_ROLE]->(r:Role)-[:CAN_ACCESS {permission:'READ'}]->(d:Document)
                RETURN DISTINCT d.id AS doc_id
                '''
                res = await session.run(cypher, user_id=user_id)
                doc_ids = [r["doc_id"] async for r in res]
        except Exception:
            raise AppError("RBAC service unavailable", status_code=HTTP_503_SERVICE_UNAVAILABLE, code="RBAC_UNAVAILABLE")
        _cache[cache_key] = doc_ids
        return doc_ids

    async def get_full_graph(self):
        nodes = []
        links = []
        try:
            async with self._driver.session() as session:
                # Get nodes
                res = await session.run("MATCH (n) RETURN id(n) as id, labels(n)[0] as label, properties(n) as props")
                async for r in res:
                    name = r["props"].get("email") or r["props"].get("name") or r["props"].get("id") or "Unknown"
                    nodes.append({"id": str(r["id"]), "label": str(name), "type": r["label"]})
                
                # Get relationships
                res = await session.run("MATCH (n)-[r]->(m) RETURN id(n) as source, id(m) as target, type(r) as type")
                async for r in res:
                    links.append({"source": str(r["source"]), "target": str(r["target"]), "label": r["type"]})
        except Exception:
            raise AppError("Failed to fetch graph data", status_code=HTTP_503_SERVICE_UNAVAILABLE, code="NEO4J_ERROR")
        return {"nodes": nodes, "links": links}
