# Evora Cloud Project - Microservices Architecture

## Project Overview

Evora is a microservices-based event management platform built with **FastAPI**, **PostgreSQL**, and **Docker**. The system handles user management, event management, event registrations, and notifications through independent, scalable microservices.

---

## Current Project Structure

```
cloud-project/
├── docker-compose.yml          # Orchestration for all services and database
├── envy/                        # Python virtual environment
├── user-service/               # User management microservice  IN PROGRESS
│   ├── main.py
│   ├── models.py              # SQLAlchemy User model
│   ├── database.py            # DB connection & session management
│   ├── routes.py              # API endpoints
│   ├── schema.py              # Pydantic request/response schemas
│   ├── crud.py                # Database operations
│   ├── auth.py                # JWT & password hashing logic
│   ├── requirements.txt
│   ├── Dockerfile
│   └── create_tables.py        # Table initialization script
├── event-service/              # Event management microservice ⏳ NOT STARTED
├── event-registration-service/ # Event registration handling ⏳ NOT STARTED
├── notifictions-emailing-service/ # Notifications service ⏳ NOT STARTED
└── api-gateway/               # API Gateway ⏳ NOT STARTED
```

---

## Project Progress

### Completed (User Service)
- **Database Setup**: PostgreSQL container with proper migrations
- **User Model**: SQLAlchemy ORM model with fields: id, username, email, password_hash, role, is_active, date_joined
- **Database Connection**: Environment-based connection string using container networking
- **CRUD Operations**: Create, read user by ID, username, and email
- **Authentication**:
  - Password hashing with `pbkdf2_sha256`
  - JWT token generation with 180-minute expiration
  - Token verification and validation
- **API Endpoints**:
  - `POST /users/register` - User registration
  - `POST /users/login` - User login with JWT token response
  - `GET /users/{user_id}` - Fetch user by ID
  - `GET /users/me` - Get current authenticated user (needs bearer token)
- **Response Models**: Proper Pydantic validation with `UserResponse`, `TokenResponse`, `UserData` schemas

### In Progress
- **Bearer Token Extraction**: `/users/me` endpoint needs to extract token from `Authorization: Bearer <token>` header
- **Protected Route Dependency**: Create auth dependency for protected endpoints

### Not Started (Missing Services)
1. **Event Service** - Create, read, update, delete events
2. **Event Registration Service** - Handle user registrations for events
3. **Notification/Email Service** - Send registration confirmations and notifications
4. **API Gateway** - Route requests to appropriate microservices

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI |
| Server | Uvicorn |
| Database | PostgreSQL 18 |
| ORM | SQLAlchemy |
| Auth | JWT (PyJWT) |
| Password Hashing | Passlib + pbkdf2_sha256 |
| Containerization | Docker & Docker Compose |
| Python Version | 3.13 / 3.14 |

---

## Environment Setup

### Prerequisites
- Docker & Docker Compose installed
- Python 3.13+ (for local development)
- Git

### Step 1: Clone & Navigate
```bash
cd /home/kali/studies/cloud-project
```

### Step 2: Create Environment File
Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb
SECRET_KEY=your_super_secret_key_here_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=180
```

### Step 3: Setup Virtual Environment (Local Development)
```bash
# Activate the existing virtual environment
source envy/bin/activate

# Or create a new one if needed
python -m venv envy
source envy/bin/activate
```

### Step 4: Install Dependencies
```bash
pip install -r user-service/requirements.txt
```

### Step 5: Initialize Database Tables
```bash
cd user-service
python create_tables.py
cd ..
```

---

## Running the Project

### Option A: Docker Compose (Recommended for Full Stack)
```bash
# Start all services
docker compose up -d

# Start only postgres and user-service
docker compose up -d postgres-db user-service

# View logs
docker compose logs -f user-service

# Stop all services
docker compose down
```

### Option B: Local Development (User Service Only)
Requires PostgreSQL running either in Docker or locally.

```bash
# Start PostgreSQL only
docker compose up -d postgres-db

# From project root, activate venv and run user-service
source envy/bin/activate
cd user-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option C: Single Container Build & Run
```bash
# Build user-service image
docker build -t evora-user-service ./user-service

# Run with Compose network
docker network create evora-net
docker run --rm -p 8000:8000 --network evora-net \
  -e DATABASE_URL="postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb" \
  -e SECRET_KEY="your_secret_key" \
  evora-user-service
```

---

## API Documentation

### User Service Endpoints

#### 1. Register User
```http
POST /users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
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

#### 2. Login User
```http
POST /users/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}
```
**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true
  }
}
```

#### 3. Get User by ID
```http
GET /users/1

Authorization: Bearer <token>
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

#### 4. Get Current User Profile
```http
GET /users/me

Authorization: Bearer <token>
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

---

## Testing the API

### Using cURL
```bash
# Register
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123"}'

# Login
curl -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123"}'

# Get current user (use token from login)
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using FastAPI Docs
Visit: `http://localhost:8000/docs`

This provides an interactive Swagger UI to test all endpoints.

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

## JWT Authentication Flow

1. **Registration**: User creates account → password is hashed with pbkdf2_sha256 → user stored in DB
2. **Login**: User sends username/password → password verified → JWT token generated with user claims (username, email, role, is_active) → token sent back
3. **Protected Routes**: Client sends token in `Authorization: Bearer <token>` header → token verified → payload extracted → user accessed
4. **Token Expiry**: Tokens expire after 180 minutes (3 hours)

---

## Common Issues & Solutions

### Issue: `could not translate host name "postgres-db" to address`
**Solution**: Ensure containers are on the same Docker network or use `docker compose up`

### Issue: Database table doesn't exist
**Solution**: Run `python create_tables.py` after starting the database

### Issue: JWT verification fails
**Solution**: Ensure `SECRET_KEY` environment variable is set correctly

### Issue: Port 8000 already in use
**Solution**: Change port in docker-compose.yml or use `docker run -p 8001:8000 ...`

---

## Development Guidelines

### File Structure for Each Microservice
```
service-name/
├── main.py              # FastAPI app initialization
├── models.py            # SQLAlchemy ORM models
├── schema.py            # Pydantic request/response schemas
├── database.py          # DB connection & session
├── crud.py              # Database operations
├── routes.py            # API endpoints
├── auth.py              # Authentication/Authorization logic
├── requirements.txt     # Dependencies
├── Dockerfile           # Container configuration
└── create_tables.py     # Database initialization
```

### Dependencies to Add
For each new service:
```
fastapi==0.136.1
uvicorn[standard]==0.30.0
sqlalchemy==2.0.30
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
email-validator==2.3.0
python-dotenv==1.0.0
```

### Before Committing Code
- All services must have a Dockerfile
- All services must have requirements.txt
- All endpoints must be documented in code
- Environment variables must have defaults or .env.example

---

## Next Steps for Implementation

### Phase 2: Event Service
- [ ] Define Event model (id, title, description, date, location, capacity, creator_id)
- [ ] Create CRUD operations for events
- [ ] Implement event routes (GET all, POST create, PUT update, DELETE)
- [ ] Add JWT protection to modify endpoints

### Phase 3: Event Registration Service
- [ ] Define Registration model (id, user_id, event_id, registered_at, status)
- [ ] Create registration CRUD operations
- [ ] Implement event capacity checking
- [ ] Create routes for registration management

### Phase 4: Notification Service
- [ ] Setup email configuration
- [ ] Create notification model for audit logs
- [ ] Implement email sending on registration
- [ ] Add event reminder notifications

### Phase 5: API Gateway
- [ ] Setup rate limiting
- [ ] Implement request routing to microservices
- [ ] Add authentication middleware
- [ ] Add logging and monitoring

---

## Team Collaboration

### Branching Strategy
```
main (production)
├── develop (staging)
├── feature/user-service
├── feature/event-service
├── feature/event-registration-service
├── feature/notification-service
└── feature/api-gateway
```

### Code Review Checklist
- [ ] Code follows project structure
- [ ] Environment variables are documented
- [ ] Endpoints are tested
- [ ] Dependencies are in requirements.txt
- [ ] Dockerfile is present and tested

---

## Useful Commands

```bash
# View container logs
docker compose logs -f user-service

# Execute command in running container
docker exec -it evora-user-service bash

# Connect to PostgreSQL
docker exec -it evora-db psql -U db_admin -d evoradb

# Rebuild images
docker compose build --no-cache

# Clean up all containers/volumes
docker compose down -v
```

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
- [PyJWT](https://pyjwt.readthedocs.io/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Contact & Support

For questions about the project setup or architecture, refer to this README or consult the team lead.

**Last Updated**: May 9, 2026
