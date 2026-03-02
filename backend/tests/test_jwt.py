from app.core.security import create_access_token, decode_and_validate_jwt

def test_jwt_roundtrip():
    t = create_access_token(user_id="u1", roles=["auditor"])
    p = decode_and_validate_jwt(t, expected_type="access")
    assert p["sub"] == "u1"
    assert "auditor" in p["roles"]
