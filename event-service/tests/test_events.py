"""
Comprehensive tests for the Event Service API.
Covers: CRUD, Search endpoints, Authorization.
"""
import pytest
from conftest import make_auth_header


# ── Create Event Tests ──────────────────────────────────────────

class TestCreateEvent:
    def test_create_event_success(self, client):
        headers = make_auth_header(user_id=1, username="organizer", role="organizer")
        res = client.post("/", json={
            "name": "Test Tech Conference",
            "category": "Technology",
            "description": "A test conference",
            "location": "Cairo, Egypt",
            "is_online": False,
            "start_date": "2027-06-15T09:00:00Z",
            "end_date": "2027-06-16T18:00:00Z",
            "capacity": 200,
            "price": 50.0,
            "is_published": True
        }, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "Test Tech Conference"
        assert data["organizer_id"] == 1
        assert data["is_published"] == True

    def test_create_event_draft(self, client):
        headers = make_auth_header(user_id=1)
        res = client.post("/", json={
            "name": "Draft Workshop",
            "category": "Workshop",
            "description": "Not published yet",
            "location": "Online",
            "is_online": True,
            "start_date": "2027-07-01T10:00:00Z",
            "end_date": "2027-07-01T16:00:00Z",
            "capacity": 50,
            "price": 0.0,
            "is_published": False
        }, headers=headers)
        assert res.status_code == 201
        assert res.json()["is_published"] == False

    def test_create_event_no_auth(self, client):
        res = client.post("/", json={
            "name": "Unauthorized Event",
            "category": "Music",
            "location": "Test",
            "start_date": "2027-08-01T10:00:00Z",
            "end_date": "2027-08-01T18:00:00Z",
            "capacity": 100,
            "price": 0
        })
        assert res.status_code == 401

    def test_create_event_end_before_start(self, client):
        headers = make_auth_header(user_id=1)
        res = client.post("/", json={
            "name": "Bad Dates Event",
            "category": "Music",
            "location": "Test",
            "start_date": "2027-08-15T18:00:00Z",
            "end_date": "2027-08-15T09:00:00Z",
            "capacity": 100,
            "price": 0
        }, headers=headers)
        assert res.status_code == 422

    def test_create_second_organizer_event(self, client):
        """Create an event by a different organizer for authorization tests."""
        headers = make_auth_header(user_id=2, username="other_org", role="organizer")
        res = client.post("/", json={
            "name": "Other Org's Event",
            "category": "Business",
            "location": "London, UK",
            "start_date": "2027-09-01T10:00:00Z",
            "end_date": "2027-09-02T18:00:00Z",
            "capacity": 300,
            "price": 100.0,
            "is_published": True
        }, headers=headers)
        assert res.status_code == 201


# ── Read Events Tests ───────────────────────────────────────────

class TestReadEvents:
    def test_list_published_events(self, client):
        res = client.get("/")
        assert res.status_code == 200
        events = res.json()
        assert isinstance(events, list)
        # Draft events should NOT appear
        assert all(e["is_published"] for e in events)

    def test_get_event_by_id(self, client):
        res = client.get("/1")
        assert res.status_code == 200
        assert res.json()["name"] == "Test Tech Conference"

    def test_get_nonexistent_event(self, client):
        res = client.get("/9999")
        assert res.status_code == 404


# ── Search Tests ────────────────────────────────────────────────

class TestSearchEvents:
    def test_search_by_category(self, client):
        res = client.get("/search/category/Technology")
        assert res.status_code == 200
        events = res.json()
        assert len(events) >= 1
        assert all(e["category"] == "Technology" for e in events)

    def test_search_by_location(self, client):
        res = client.get("/search/location/Cairo, Egypt")
        assert res.status_code == 200
        assert len(res.json()) >= 1

    def test_search_by_price(self, client):
        res = client.get("/search/price/0.0")
        assert res.status_code == 200
        # Free events only
        for evt in res.json():
            assert evt["price"] <= 0.0

    def test_search_by_organizer(self, client):
        res = client.get("/search/organizer/1")
        assert res.status_code == 200
        for evt in res.json():
            assert evt["organizer_id"] == 1

    def test_search_empty_results(self, client):
        res = client.get("/search/category/NonexistentCategory")
        assert res.status_code == 200
        assert res.json() == []


# ── Update Event Tests ──────────────────────────────────────────

class TestUpdateEvent:
    def test_update_own_event(self, client):
        headers = make_auth_header(user_id=1, role="organizer")
        res = client.put("/1", json={"price": 75.0, "capacity": 300}, headers=headers)
        assert res.status_code == 200
        assert res.json()["price"] == 75.0
        assert res.json()["capacity"] == 300

    def test_update_not_owner(self, client):
        headers = make_auth_header(user_id=99, role="organizer")
        res = client.put("/1", json={"price": 0}, headers=headers)
        assert res.status_code == 403

    def test_update_as_admin(self, client):
        headers = make_auth_header(user_id=99, role="admin")
        res = client.put("/1", json={"description": "Admin-updated description"}, headers=headers)
        assert res.status_code == 200

    def test_update_nonexistent_event(self, client):
        headers = make_auth_header(user_id=1, role="organizer")
        res = client.put("/9999", json={"price": 0}, headers=headers)
        assert res.status_code == 404


# ── Delete Event Tests ──────────────────────────────────────────

class TestDeleteEvent:
    def test_delete_not_owner(self, client):
        headers = make_auth_header(user_id=99, role="organizer")
        res = client.delete("/3", headers=headers)
        assert res.status_code == 403

    def test_delete_own_event(self, client):
        headers = make_auth_header(user_id=2, username="other_org", role="organizer")
        res = client.delete("/3", headers=headers)
        assert res.status_code == 204

    def test_delete_nonexistent(self, client):
        headers = make_auth_header(user_id=1, role="organizer")
        res = client.delete("/9999", headers=headers)
        assert res.status_code == 404
