"""
Comprehensive tests for the User Service API.
Covers: Registration, Login, Profile, Update, Role Upgrade.
"""
import pytest


# ── Registration Tests ──────────────────────────────────────────

class TestRegistration:
    def test_register_success(self, client):
        res = client.post("/register", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert "id" in data

    def test_register_duplicate_username(self, client):
        res = client.post("/register", json={
            "username": "testuser",
            "email": "different@example.com",
            "password": "TestPass123"
        })
        assert res.status_code == 400
        assert "already registered" in res.json()["detail"].lower() or "already" in res.json()["detail"].lower()

    def test_register_duplicate_email(self, client):
        res = client.post("/register", json={
            "username": "different_user",
            "email": "test@example.com",
            "password": "TestPass123"
        })
        assert res.status_code == 400

    def test_register_short_password(self, client):
        res = client.post("/register", json={
            "username": "shortpw",
            "email": "short@example.com",
            "password": "123"
        })
        assert res.status_code == 422  # Pydantic validation error

    def test_register_invalid_email(self, client):
        res = client.post("/register", json={
            "username": "bademail",
            "email": "not-an-email",
            "password": "TestPass123"
        })
        assert res.status_code == 422

    def test_register_second_user(self, client):
        """Register a second user for subsequent tests."""
        res = client.post("/register", json={
            "username": "organizer_user",
            "email": "organizer@example.com",
            "password": "OrgPass123"
        })
        assert res.status_code == 200


# ── Login Tests ─────────────────────────────────────────────────

class TestLogin:
    def test_login_success(self, client):
        res = client.post("/login", data={
            "username": "testuser",
            "password": "TestPass123"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["data"]["username"] == "testuser"

    def test_login_wrong_password(self, client):
        res = client.post("/login", data={
            "username": "testuser",
            "password": "WrongPassword"
        })
        assert res.status_code == 403
        assert "wrong password" in res.json()["detail"].lower()

    def test_login_nonexistent_user(self, client):
        res = client.post("/login", data={
            "username": "no_such_user",
            "password": "TestPass123"
        })
        assert res.status_code == 403
        assert "not found" in res.json()["detail"].lower()


# ── Profile / Me Tests ──────────────────────────────────────────

class TestProfile:
    @pytest.fixture(autouse=True)
    def _login(self, client):
        res = client.post("/login", data={"username": "testuser", "password": "TestPass123"})
        self.token = res.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_get_me(self, client):
        res = client.get("/me", headers=self.headers)
        assert res.status_code == 200
        data = res.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["role"] == "user"

    def test_get_me_no_token(self, client):
        res = client.get("/me")
        assert res.status_code == 401

    def test_get_me_invalid_token(self, client):
        res = client.get("/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert res.status_code == 401


# ── Update Profile Tests ────────────────────────────────────────

class TestUpdateProfile:
    @pytest.fixture(autouse=True)
    def _login(self, client):
        res = client.post("/login", data={"username": "testuser", "password": "TestPass123"})
        self.token = res.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_update_email(self, client):
        res = client.put("/me", json={
            "username": "testuser",
            "email": "updated@example.com"
        }, headers=self.headers)
        assert res.status_code == 200
        assert res.json()["email"] == "updated@example.com"

    def test_update_restore_email(self, client):
        """Restore the email for other tests."""
        res = client.put("/me", json={
            "username": "testuser",
            "email": "test@example.com"
        }, headers=self.headers)
        assert res.status_code == 200


# ── Role Upgrade Tests ──────────────────────────────────────────

class TestRoleUpgrade:
    @pytest.fixture(autouse=True)
    def _login(self, client):
        res = client.post("/login", data={"username": "organizer_user", "password": "OrgPass123"})
        self.token = res.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_upgrade_to_organizer(self, client):
        res = client.put("/me/role", json={"requested_role": "organizer"}, headers=self.headers)
        assert res.status_code == 200
        assert res.json()["role"] == "organizer"

    def test_upgrade_already_organizer(self, client):
        # Re-login to get fresh token with updated role claim
        login_res = client.post("/login", data={"username": "organizer_user", "password": "OrgPass123"})
        token = login_res.json()["access_token"]
        res = client.put("/me/role", json={"requested_role": "organizer"}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 400
        assert "already" in res.json()["detail"].lower()

    def test_upgrade_invalid_role(self, client):
        res = client.put("/me/role", json={"requested_role": "admin"}, headers=self.headers)
        assert res.status_code == 400


# ── Get User by ID Tests ────────────────────────────────────────

class TestGetUserById:
    def test_get_existing_user(self, client):
        res = client.get("/get/1")
        assert res.status_code == 200
        assert res.json()["username"] == "testuser"

    def test_get_nonexistent_user(self, client):
        res = client.get("/get/9999")
        assert res.status_code == 404
