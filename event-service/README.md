# Event Service — API Documentation

## Overview

The Event Service handles creation, categorization, searching, and management of events within the Evora platform. It supports background image uploads and relies on JWT tokens issued by the User Service for stateless authentication and authorization.

---

## Features

- Complete CRUD lifecycle for events
- Background image upload per event (`POST /{event_id}/image`)
- Advanced search filters (by category, location, price, organizer)
- Pydantic validation (e.g., `end_date` must be after `start_date`)
- Draft/Publish workflow (`is_published` toggles public visibility)
- Ownership security (only the organizer or admin can modify/delete)
- Static file serving for uploaded images

---

## Environment Variables

```env
DATABASE_URL=postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb
SECRET_KEY=your_secret_key_here_change_in_production
```

> **Critical**: `SECRET_KEY` must match the User Service for JWT verification.

---

## Database Schema

### Events Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL,
  price FLOAT NOT NULL DEFAULT 0.0,
  organizer_id INTEGER NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Event CRUD

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/` | Bearer | Create event (organizer_id from JWT) |
| `GET` | `/` | — | List all published events |
| `GET` | `/{event_id}` | — | Get event details |
| `PUT` | `/{event_id}` | Bearer | Update event (owner/admin only) |
| `DELETE` | `/{event_id}` | Bearer | Delete event (owner/admin only) |

### Search

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/search/category/{category}` | Filter by category |
| `GET` | `/search/location/{location}` | Filter by exact location |
| `GET` | `/search/price/{price}` | Filter by price |
| `GET` | `/search/organizer/{organizer_id}` | Filter by organizer |

### Image Upload

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/{event_id}/image` | Bearer | Upload background image (owner/admin only) |

**Image Upload Details:**
- Content-Type: `multipart/form-data`
- Field: `file`
- Allowed types: JPEG, PNG, WebP, GIF
- Max size: 2 MB
- Served at: `/events/static/uploads/events/{filename}` (through Nginx)

---

## Authentication & Authorization

The Event Service uses **Stateless JWT Authentication**:

1. It does **not** query the `users` table
2. It verifies JWT signature using its own `SECRET_KEY`
3. If valid, it trusts the `id`, `username`, and `role` claims in the payload
4. Write operations require ownership (`organizer_id == jwt.id`) or `admin` role

---

## Database Migrations

```bash
# Generate migration after model changes
docker exec -w /app evora-event-service alembic revision --autogenerate -m "describe changes"

# Apply migrations
docker exec -w /app evora-event-service alembic upgrade head
```

Uses isolated `event_alembic_version` table to avoid conflicts with other services.

---

## Testing

The event service has **20 automated tests** covering:

- Create event (success, unauthorized, validation)
- List events (all, empty DB)
- Get event (success, not found)
- Search (by category, location, price, organizer)
- Update event (owner, non-owner, admin override)
- Delete event (owner, non-owner, nonexistent)

```bash
docker compose -f docker-compose.test.yml up --build event-service-test
```

---

## File Structure

```
event-service/
├── main.py              # FastAPI app + StaticFiles mount for uploads
├── models.py            # SQLAlchemy Event model (with image_url)
├── schema.py            # Pydantic schemas (EventCreate, EventUpdate, EventResponse)
├── database.py          # DB connection and session
├── routes.py            # API endpoints + image upload handler
├── crud.py              # Database CRUD operations and search filters
├── auth.py              # Stateless JWT verification
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker configuration
├── alembic/             # Database migration scripts
├── tests/               # Pytest test suite
│   ├── conftest.py      # Shared fixtures (DB, client, JWT minting)
│   └── test_events.py   # 20 test cases
└── README.md            # This file
```

---

**Last Updated**: May 12, 2026
