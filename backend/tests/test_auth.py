import pytest

ADMIN_EMAIL = "admin@rentflow.app"
ADMIN_PASSWORD = "ChangeMe123!"

pytestmark = pytest.mark.asyncio


async def test_login_rejects_wrong_password(client, auth_headers):
    r = await client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


async def test_login_succeeds_and_returns_token(client, auth_headers):
    r = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "remember": True}
    )
    assert r.status_code == 200
    assert "access_token" in r.json()


async def test_me_requires_auth(client):
    r = await client.get("/api/auth/me")
    assert r.status_code in (401, 403)


async def test_me_returns_profile(client, auth_headers):
    r = await client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


async def test_change_password_requires_correct_current_password(client, auth_headers):
    r = await client.put(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "wrong", "new_password": "newpass123"},
    )
    assert r.status_code == 400


async def test_change_password_success_then_relogin(client, auth_headers):
    r = await client.put(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": ADMIN_PASSWORD, "new_password": "newpass123"},
    )
    assert r.status_code == 200
    r = await client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "newpass123"})
    assert r.status_code == 200


async def test_setup_status_true_when_no_users(client):
    r = await client.get("/api/auth/setup-status")
    assert r.status_code == 200
    assert r.json()["needs_setup"] is True


async def test_setup_status_false_once_a_user_exists(client, auth_headers):
    r = await client.get("/api/auth/setup-status")
    assert r.status_code == 200
    assert r.json()["needs_setup"] is False


async def test_register_creates_account_and_returns_token(client):
    r = await client.post(
        "/api/auth/register",
        json={"full_name": "Chu tro moi", "email": "owner@rentflow.app", "password": "SecurePass1"},
    )
    assert r.status_code == 201, r.text
    assert "access_token" in r.json()

    r = await client.get("/api/auth/setup-status")
    assert r.json()["needs_setup"] is False


async def test_register_blocked_after_setup_complete(client, auth_headers):
    r = await client.post(
        "/api/auth/register",
        json={"full_name": "Ke gian", "email": "intruder@rentflow.app", "password": "SecurePass1"},
    )
    assert r.status_code == 403


async def test_second_register_attempt_always_blocked_by_setup_guard(client):
    await client.post(
        "/api/auth/register",
        json={"full_name": "A", "email": "dup@rentflow.app", "password": "SecurePass1"},
    )
    # Setup is now complete, so any further register call is rejected by the
    # setup guard (403) before it even reaches the duplicate-email check —
    # this is what guarantees RentFlow only ever has one landlord account.
    r = await client.post(
        "/api/auth/register",
        json={"full_name": "B", "email": "dup2@rentflow.app", "password": "SecurePass1"},
    )
    assert r.status_code == 403
