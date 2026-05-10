# User Service - API Documentation

## Overview

The User Service handles user registration, authentication, and profile management. It provides JWT-based authentication for other microservices.

---

## Features

- User registration with email validation
- User login with JWT token generation
- Password hashing with pbkdf2_sha256
- User profile retrieval
- Role-based access (default: "user")
- Active/inactive user status

---

## Environment Variables

```env
DATABASE_URL=postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb
SECRET_KEY=your_secret_key_here_change_in_production
```

Optional configuration (with defaults):
- `ALGORITHM=HS256` - JWT algorithm
- `ACCESS_TOKEN_EXPIRE_MINUTES=180` - Token expiration time

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
  date_joined TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### 1. Register User
Creates a new user account.

**Request:**
```http
POST /users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Validation:**
- `username`: 3-100 characters
- `email`: Valid email format
- `password`: Minimum 8 characters

**Response (201):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "is_active": true,
  "date_joined": "2026-05-09T13:30:00"
}
```

**Error (400):**
```json
{
  "detail": "Username or email already registered"
}
```

---

### 2. Login User
Authenticates user and returns JWT token (OAuth2 compatible).

**Request:**
```http
POST /users/login
Content-Type: application/x-www-form-urlencoded

username=john_doe&password=SecurePassword123
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG5fZG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpc19hY3RpdmUiOnRydWUsImV4cCI6MTcyODQ0Nzc3M30.kU7xvZNk5oqw...",
  "token_type": "bearer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true
  }
}
```

**Error (403):**
```json
{
  "detail": "Login failed, Account not found."
}
```

or

```json
{
  "detail": "Login failed, Wrong password."
}
```

---

### 3. Get User by ID
Retrieves a specific user by ID.

**Request:**
```http
GET /users/1
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "is_active": true,
  "date_joined": "2026-05-09T13:30:00"
}
```

**Error (404):**
```json
{
  "detail": "User not found"
}
```

---

### 4. Get Current User Profile
Retrieves authenticated user's profile from JWT token.

**Request:**
```http
GET /users/me
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "is_active": true
}
```

**Error (401):**
```json
{
  "detail": "Could not validate credentials"
}
```

---

### 5. Get Admin Data (Example Role-Based Route)
Retrieves admin-specific data. Requires `admin` role.

**Request:**
```http
GET /users/admin
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "admin_user",
  "email": "admin@example.com",
  "role": "admin",
  "is_active": true
}
```

**Error (403):**
```json
{
  "detail": "Operation not permitted"
}
```

---

## JWT Authentication

### Token Structure
JWT tokens contain the following claims:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "is_active": true,
  "exp": 1728447773
}
```

### Token Expiration
- Default: 180 minutes (3 hours)
- Configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` environment variable

### Using Tokens
Include token in request header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Authentication Flow

1. **Registration**
   - User provides username, email, password
   - Password hashed with pbkdf2_sha256
   - User created in database with role="user"

2. **Login**
   - User sends username/password
   - Password verified against stored hash
   - JWT token generated with user claims
   - Token returned to client

3. **Protected Requests**
   - Client includes token in Authorization header
   - Token decoded and verified
   - User claims extracted from token
   - Request processed with user context

4. **Token Expiry**
   - Tokens expire after configured time
   - Expired tokens return 403 Unauthorized
   - User must login again to get new token

---

## Testing

### Using FastAPI Docs (Interactive)
```
http://localhost:8000/docs
```
Provides interactive Swagger UI for testing all endpoints.

### Using cURL

**Register:**
```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=TestPass123"
```

**Get Current User** (save token from login response):
```bash
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get User by ID:**
```bash
curl -X GET "http://localhost:8000/users/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Running User Service

### With Docker Compose
```bash
# From project root
docker compose up -d postgres-db user-service

# View logs
docker compose logs -f user-service

# Stop service
docker compose stop user-service
```

### Local Development
```bash
# From project root
source envy/bin/activate

# Ensure PostgreSQL is running
docker compose up -d postgres-db

# Initialize database (first time only)
cd user-service
python create_tables.py
cd ..

# Start service with hot-reload
cd user-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Build & Run
```bash
# Build image
docker build -t evora-user-service ./user-service

# Run container
docker run --rm -p 8000:8000 \
  -e DATABASE_URL="postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb" \
  -e SECRET_KEY="your_secret_key" \
  evora-user-service
```

---

## File Structure

```
user-service/
├── main.py              # FastAPI application setup
├── models.py            # SQLAlchemy User model
├── schema.py            # Pydantic schemas (requests/responses)
├── database.py          # Database connection and session
├── routes.py            # API endpoints
├── crud.py              # Database CRUD operations
├── auth.py              # JWT and password hashing
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker configuration
├── create_tables.py     # Initialize database tables
└── README.md            # This file
```

### Key Files

**main.py** - FastAPI app initialization
- Creates FastAPI application instance
- Includes router from routes.py
- Configures app metadata

**models.py** - User SQLAlchemy model
- Defines users table schema
- Relationships and constraints

**schema.py** - Pydantic schemas
- `UserCreate` - Registration request validation
- `UserLogin` - Login request validation
- `UserResponse` - User response validation
- `TokenResponse` - Login response with token
- `UserData` - User data in token

**database.py** - Database setup
- Creates SQLAlchemy engine
- Configures session factory
- Provides `get_db()` dependency

**routes.py** - API endpoints
- Register: `POST /users/register`
- Login: `POST /users/login`
- Get by ID: `GET /users/{user_id}`
- Get current: `GET /users/me`

**crud.py** - Database operations
- `create_user()` - Create new user
- `get_user_by_id()` - Fetch user by ID
- `get_user_by_username()` - Fetch user by username
- `get_user_by_email()` - Fetch user by email

**auth.py** - Authentication logic
- `hash_password()` - Hash password with pbkdf2_sha256
- `verify_password()` - Verify password against hash
- `sign_token()` - Generate JWT token
- `verify_token()` - Validate and decode JWT
- `get_current_user()` - FastAPI Dependency to extract and verify the JWT token
- `RoleChecker()` - FastAPI Dependency for role-based authorization

---

## Common Issues & Solutions

### Issue: Database connection fails
**Error:** `could not translate host name "postgres-db"`
**Solution:** 
- Ensure PostgreSQL container is running: `docker compose ps`
- Check DATABASE_URL uses correct hostname
- For local dev, use `localhost` instead of `postgres-db`

### Issue: Token verification fails
**Error:** `"Could not validate credentials"`
**Solution:**
- Verify token is included in Authorization header
- Check token format: `Bearer <token>`
- Ensure SECRET_KEY matches between token generation and verification
- Check if token has expired

### Issue: Registration fails with duplicate error
**Error:** `Username or email already registered`
**Solution:**
- Use unique username and email
- Check existing users: `docker exec evora-db psql -U db_admin -d evoradb -c "SELECT * FROM users;"`

### Issue: Password hash errors
**Error:** Various passlib errors
**Solution:**
- Ensure pbkdf2_sha256 scheme is available in passlib
- Reinstall passlib: `pip install --upgrade passlib`

---

## Development Checklist

Before committing changes:
- [ ] All endpoints tested with correct payloads
- [ ] Error responses handled properly
- [ ] Environment variables documented
- [ ] Dependencies added to requirements.txt
- [ ] Code follows project structure
- [ ] No hardcoded secrets

---

## Additional Notes

- Passwords are hashed using pbkdf2_sha256, not bcrypt due to library compatibility
- JWT tokens use HS256 algorithm with SECRET_KEY
- User roles default to "user" on registration
- All users are active (is_active=true) by default on registration
- date_joined is automatically set to current UTC time

---

**Last Updated**: May 9, 2026
