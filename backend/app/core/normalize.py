import re
_ws=re.compile(r"\s+")
_ctrl=re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F]")
def normalize_query(q:str)->str:
    q=q.strip()
    q=_ctrl.sub(" ", q)
    q=_ws.sub(" ", q)
    return q
