"""Tests for Emergent Google Auth endpoints."""
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://nakit-akisi-7.preview.emergentagent.com').rstrip('/')
VALID_TOKEN = "test_session_fixed_token_abc123"
EXPIRED_TOKEN = "test_session_expired_token_xyz789"


def test_root():
    r = requests.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert r.json().get("message") == "Hello World"


def test_me_without_auth():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_me_with_valid_bearer():
    r = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {VALID_TOKEN}"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user_id"] == "test-user-fixed"
    assert data["email"] == "test.user@example.com"
    assert data["name"] == "Test User"


def test_me_with_expired_session():
    r = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {EXPIRED_TOKEN}"})
    assert r.status_code == 401
    assert "expired" in r.json().get("detail", "").lower()


def test_session_missing_body():
    r = requests.post(f"{BASE_URL}/api/auth/session", json={})
    assert r.status_code == 400


def test_session_bogus_id():
    r = requests.post(f"{BASE_URL}/api/auth/session", json={"session_id": "bogus_invalid_xxx"})
    assert r.status_code in (401, 502)


def test_logout_and_session_cleared():
    # seed a session just for logout
    import pymongo
    from datetime import datetime, timezone, timedelta
    mclient = pymongo.MongoClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
    mdb = mclient[os.environ.get('DB_NAME', 'test_database')]
    token = "test_logout_token_123"
    mdb.user_sessions.delete_many({"session_token": token})
    mdb.user_sessions.insert_one({
        "user_id": "test-user-fixed",
        "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    r = requests.post(f"{BASE_URL}/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json() == {"ok": True}
    assert mdb.user_sessions.find_one({"session_token": token}) is None
