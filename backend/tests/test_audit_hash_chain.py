from app.services.audit_log import compute_hash

def test_hash_chain_deterministic():
    prev="0"*64
    payload={"timestamp_utc":"2026-01-01T00:00:00+00:00","user_id":"u1","action":"QUERY","outcome":"ALLOW","resource_ids":["d1"],"client_ip":"127.0.0.1","roles":["auditor"]}
    assert compute_hash(prev,payload)==compute_hash(prev,payload)
