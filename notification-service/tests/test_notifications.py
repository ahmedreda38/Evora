"""
Tests for the Notification Service API.
Covers: Send, List, Mark as Read, Unread Count.
"""
import pytest
from conftest import make_auth_header


class TestSendNotification:
    def test_send_notification_success(self, client):
        headers = make_auth_header(user_id=1)
        res = client.post("/send", json={
            "user_id": 1,
            "recipient_email": "test@example.com",
            "subject": "Booking Confirmation",
            "message": "You have been registered for the event!"
        }, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert data["subject"] == "Booking Confirmation"
        assert data["status"] == "sent"
        assert data["is_read"] == False

    def test_send_second_notification(self, client):
        headers = make_auth_header(user_id=1)
        res = client.post("/send", json={
            "user_id": 1,
            "recipient_email": "test@example.com",
            "subject": "Event Reminder",
            "message": "Your event starts tomorrow!"
        }, headers=headers)
        assert res.status_code == 201

    def test_send_notification_no_auth(self, client):
        res = client.post("/send", json={
            "user_id": 1,
            "recipient_email": "test@example.com",
            "subject": "Test",
            "message": "Test"
        })
        assert res.status_code == 401

    def test_send_notification_wrong_user(self, client):
        headers = make_auth_header(user_id=2)
        res = client.post("/send", json={
            "user_id": 1,
            "recipient_email": "test@example.com",
            "subject": "Fake",
            "message": "Impersonation attempt"
        }, headers=headers)
        assert res.status_code == 403


class TestGetNotifications:
    def test_get_my_notifications(self, client):
        headers = make_auth_header(user_id=1)
        res = client.get("/me", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    def test_get_notifications_no_auth(self, client):
        res = client.get("/me")
        assert res.status_code == 401

    def test_get_notifications_different_user(self, client):
        headers = make_auth_header(user_id=99)
        res = client.get("/me", headers=headers)
        assert res.status_code == 200
        assert res.json() == []


class TestUnreadCount:
    def test_unread_count(self, client):
        headers = make_auth_header(user_id=1)
        res = client.get("/me/unread-count", headers=headers)
        assert res.status_code == 200
        assert res.json()["count"] == 2  # We sent 2 notifications above


class TestMarkAsRead:
    def test_mark_as_read(self, client):
        headers = make_auth_header(user_id=1)
        res = client.put("/1/read", headers=headers)
        assert res.status_code == 200
        assert res.json()["is_read"] == True

    def test_unread_count_after_read(self, client):
        headers = make_auth_header(user_id=1)
        res = client.get("/me/unread-count", headers=headers)
        assert res.status_code == 200
        assert res.json()["count"] == 1  # 1 read, 1 unread

    def test_mark_nonexistent(self, client):
        headers = make_auth_header(user_id=1)
        res = client.put("/9999/read", headers=headers)
        assert res.status_code == 404

    def test_mark_other_users_notification(self, client):
        headers = make_auth_header(user_id=99)
        res = client.put("/2/read", headers=headers)
        assert res.status_code == 403
