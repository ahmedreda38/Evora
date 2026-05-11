# Event Service - API Documentation

## Overview

The Event Service handles the creation, categorization, searching, and updating of events within the Evora platform. It relies on JWT tokens issued by the User Service to identify the event organizer statelessly.

---

## Features

- Complete CRUD lifecycle for events
- Pydantic data validation (e.g., ensuring `end_date` occurs after `start_date`)
- Advanced search filters (by category, location, price, and organizer)
- Stateless JWT authentication and authorization
- Ownership security (only the organizer or admin can modify/delete an event)
- Draft/Publish workflows (`is_published` toggles public visibility)

---

## Environment Variables

```env
DATABASE_URL=postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb
SECRET_KEY=your_secret_key_here_change_in_production
```

**CRITICAL**: The `SECRET_KEY` in this service must perfectly match the `SECRET_KEY` in the User Service to decode JWTs successfully.

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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Database Migrations (Alembic)

This service uses **Alembic** isolated via the `event_alembic_version` table so it does not conflict with the User Service.

1. **Generate the migration script** (inspects `models.py` and creates a new file in `alembic/versions/`):
```bash
docker exec -w /app evora-event-service alembic revision --autogenerate -m "describe your changes here"
```

2. **Apply the migration** to the database:
```bash
docker exec -w /app evora-event-service alembic upgrade head
```

---

## API Endpoints

### 1. Create Event
Creates a new event. Requires a valid JWT token. The `organizer_id` is automatically extracted from the token.

**Request:**
```http
POST /events/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Evora Annual Tech Fest 2026",
  "category": "Conference",
  "description": "A massive 3-day tech conference covering AI and Cloud Computing.",
  "location": "Cairo International Convention Centre",
  "is_online": false,
  "start_date": "2026-10-15T09:00:00Z",
  "end_date": "2026-10-18T18:00:00Z",
  "capacity": 500,
  "price": 150.5,
  "is_published": true
}
```

**Response (201):**
Returns the created event object including its generated `id` and `organizer_id`.

**Error (422 Unprocessable Entity):**
Triggered if `start_date` is in the past, or if `end_date` is before `start_date`.

---

### 2. List All Published Events
Retrieves a list of all events where `is_published` is `true`.

**Request:**
```http
GET /events/?skip=0&limit=100
```

---

### 3. Search Endpoints
Allows filtering events by specific criteria.

**By Category:**
```http
GET /events/search/category/Conference
```

**By Location:**
```http
GET /events/search/location/Cairo
```

**By Price:**
```http
GET /events/search/price/0.0
```

**By Organizer ID:**
```http
GET /events/search/organizer/1
```

---

### 4. Get Event Details
Retrieves a specific event by its ID.

**Request:**
```http
GET /events/1
```

**Response (200):**
Returns the event object.

**Error (404 Not Found):**
If the event ID does not exist.

---

### 5. Update Event
Modifies an existing event. Only the original `organizer` or an `admin` can perform this action.

**Request:**
```http
PUT /events/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "price": 100.0,
  "capacity": 600
}
```

---

### 6. Delete Event
Deletes an event from the database. Only the original `organizer` or an `admin` can perform this action.

**Request:**
```http
DELETE /events/1
Authorization: Bearer <jwt_token>
```

---

## Authentication & Authorization

The Event Service relies on **Stateless JWT Authentication**. 

1. It does not connect to the `users` database table.
2. It verifies the signature of the `Authorization: Bearer` token using its own copy of `SECRET_KEY`.
3. If the signature is mathematically valid, it trusts the `id`, `username`, and `role` claims encoded in the payload.

---

## Running the Event Service

### With Docker Compose
```bash
# From project root
docker compose up -d postgres-db event-service

# View logs
docker compose logs -f event-service

# Stop service
docker compose stop event-service
```

### Local Development
```bash
# From project root
source envy/bin/activate

# Ensure PostgreSQL is running
docker compose up -d postgres-db

# Initialize database (first time only)
cd event-service
alembic upgrade head
cd ..

# Start service with hot-reload
cd event-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## File Structure

```
event-service/
├── main.py              # FastAPI application & CORS setup
├── models.py            # SQLAlchemy Event model
├── schema.py            # Pydantic validation schemas (with rich examples)
├── database.py          # Database connection and session
├── routes.py            # API endpoints
├── crud.py              # Database CRUD operations and filters
├── auth.py              # Stateless JWT signature verification
├── requirements.txt     # Python dependencies
├── alembic/             # Database migration configurations
├── Dockerfile           # Docker configuration
└── README.md            # This file
```

---

**Last Updated**: May 11, 2026
