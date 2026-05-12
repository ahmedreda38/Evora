# User Service — API Documentation

## Overview

The User Service handles user registration, authentication, profile management, role upgrades, and profile image uploads. It issues JWT tokens used by all other microservices for stateless authentication.

---

## Features

- User registration with email and username validation
- OAuth2-compatible login with JWT token generation
- Profile retrieval and update (`GET /me`, `PUT /me`)
- Role-based access control (user → organizer → admin)
- Self-service role upgrade to organizer (`PUT /me/role`)
- Profile image upload (`POST /me/image`) with validation
- Password hashing with pbkdf2_sha256

---

## Environment Variables

```env
DATABASE_URL=postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb
SECRET_KEY=your_secret_key_here_change_in_production
```

Optional (with defaults):
- `ALGORITHM=HS256` — JWT algorithm
- `ACCESS_TOKEN_EXPIRE_MINUTES=180` — Token expiration (3 hours)

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  profile_image_url VARCHAR(500),
  date_joined TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | — | Create new user account |
| `POST` | `/login` | — | OAuth2 login, returns JWT |

### Profile Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/me` | Bearer | Get authenticated user's profile |
| `PUT` | `/me` | Bearer | Update username, email, password |
| `PUT` | `/me/role` | Bearer | Upgrade role to organizer |
| `POST` | `/me/image` | Bearer | Upload profile picture (2MB max) |
| `GET` | `/{user_id}` | Bearer | Get any user by ID |

### Image Upload Details

**`POST /me/image`**
- Content-Type: `multipart/form-data`
- Field: `file`
- Allowed types: JPEG, PNG, WebP, GIF
- Max size: 2 MB
- Response: Updated user profile with `profile_image_url`

---

## JWT Token Structure

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "is_active": true,
  "exp": 1728447773
}
```

The `SECRET_KEY` must be identical across all microservices for token verification.

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant U as User Service
    participant DB as Database

    C->>U: POST /register {username, email, password}
    U->>U: Hash password (pbkdf2_sha256)
    U->>DB: INSERT INTO users
    U-->>C: 201 Created (UserResponse)

    C->>U: POST /login {username, password}
    U->>DB: SELECT by username
    U->>U: Verify password hash
    U->>U: Sign JWT with SECRET_KEY
    U-->>C: 200 OK {access_token, data}
```

---

## Database Migrations

```bash
# Generate migration after model changes
docker exec -w /app evora-user-service alembic revision --autogenerate -m "describe changes"

# Apply migrations
docker exec -w /app evora-user-service alembic upgrade head
```

---

## Testing

The user service has **19 automated tests** covering:

- Registration (success, duplicate username, duplicate email, short password)
- Login (success, wrong password, nonexistent user)
- Profile (get, update username, update email)
- Role upgrade (to organizer, duplicate upgrade, invalid role)
- User lookup (by ID, nonexistent)

```bash
# Run tests via docker-compose
docker compose -f docker-compose.test.yml up --build user-service-test
```

---

## File Structure

```
user-service/
├── main.py              # FastAPI app + StaticFiles mount
├── models.py            # SQLAlchemy User model
├── schema.py            # Pydantic schemas (UserCreate, UserData, TokenResponse, etc.)
├── database.py          # DB connection and session
├── routes.py            # API endpoints (register, login, me, image upload)
├── crud.py              # Database CRUD operations
├── auth.py              # JWT + password hashing + FastAPI dependencies
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker configuration
├── alembic/             # Database migration scripts
├── tests/               # Pytest test suite
│   ├── conftest.py      # Shared fixtures (DB, client, auth tokens)
│   └── test_users.py    # 19 test cases
└── README.md            # This file
```

---

**Last Updated**: May 12, 2026
