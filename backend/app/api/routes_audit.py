import csv, io, orjson
from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, require_admin, get_current_user
from app.db.models import AuditLog
from app.schemas.audit import AuditLogOut, VerifyResult
from app.services.audit_log import verify_audit_log_chain

router = APIRouter(prefix="/audit-logs")

@router.get("", response_model=list[AuditLogOut])
async def list_audit_logs(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    from app.db.models import User
    
    stmt = select(AuditLog, User.email).outerjoin(User, AuditLog.user_id == User.id)
    if "admin" not in user.get("roles", []):
        stmt = stmt.where(AuditLog.user_id == user["user_id"])
        
    res = await db.execute(stmt.order_by(AuditLog.log_id.desc()).limit(500))
    rows = res.all()
    out=[]
    for l, email in rows:
        out.append(AuditLogOut(
            log_id=l.log_id, timestamp_utc=l.timestamp_utc, user_id=email or l.user_id,
            action=l.action, outcome=l.outcome, resource_ids=orjson.loads(l.resource_ids),
            client_ip=l.client_ip, roles=orjson.loads(l.roles),
            hash_prev=l.hash_prev, hash_curr=l.hash_curr
        ))
    return out

@router.get("/export")
async def export_audit_logs(format: str = "csv", db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    from app.db.models import User
    res = await db.execute(select(AuditLog, User.email).outerjoin(User, AuditLog.user_id == User.id).order_by(AuditLog.log_id.asc()))
    rows = res.all()
    if format.lower() == "json":
        payload=[{
            "log_id": l.log_id, "timestamp_utc": l.timestamp_utc.isoformat(), "user_id": email or l.user_id,
            "action": l.action, "outcome": l.outcome, "resource_ids": orjson.loads(l.resource_ids),
            "client_ip": l.client_ip, "roles": orjson.loads(l.roles),
            "hash_prev": l.hash_prev, "hash_curr": l.hash_curr
        } for l, email in rows]
        return Response(content=orjson.dumps(payload).decode(), media_type="application/json")
    buf=io.StringIO()
    wri=csv.writer(buf)
    wri.writerow(["log_id","timestamp_utc","user_id","action","outcome","resource_ids","client_ip","roles","hash_prev","hash_curr"])
    for l, email in rows:
        wri.writerow([l.log_id, l.timestamp_utc.isoformat(), email or l.user_id, l.action, l.outcome,
                      orjson.dumps(orjson.loads(l.resource_ids)).decode(),
                      l.client_ip, orjson.dumps(orjson.loads(l.roles)).decode(),
                      l.hash_prev, l.hash_curr])
    return Response(content=buf.getvalue(), media_type="text/csv")

@router.post("/verify", response_model=VerifyResult)
async def verify(db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    return VerifyResult(**(await verify_audit_log_chain(db)))
