from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class AuditLogOut(BaseModel):
    log_id: int
    timestamp_utc: datetime
    user_id: str
    action: str
    outcome: str
    resource_ids: List[str]
    client_ip: str
    roles: List[str]
    hash_prev: str
    hash_curr: str

class VerifyResult(BaseModel):
    ok: bool
    checked: int
    mismatch_at_log_id: Optional[int] = None
    reason: Optional[str] = None
