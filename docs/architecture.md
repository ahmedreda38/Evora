# Evora Architecture & Tech Stack

## Complete Tech Stack

### Frontend
*   **Framework**: React 18 with Vite 5
*   **Styling**: TailwindCSS 3
*   **Animation**: Framer Motion
*   **Icons**: Lucide React
*   **HTTP Client**: Axios (with interceptors for JWT)
*   **Routing**: React Router v6
*   **Notifications**: React Hot Toast

### Backend Services
*   **Framework**: FastAPI (Python 3.13+)
*   **Application Server**: Uvicorn (ASGI)
*   **Data Validation**: Pydantic v2
*   **Authentication**: PyJWT (HS256 stateless tokens)
*   **HTTP Client**: HTTPX (for synchronous inter-service calls)
*   **Password Hashing**: Passlib (pbkdf2_sha256)
*   **File Uploads**: python-multipart + FastAPI StaticFiles

### Database Layer
*   **RDBMS**: PostgreSQL 18
*   **ORM**: SQLAlchemy 2.0
*   **Migrations**: Alembic (isolated `version_table` per service for safe shared-DB usage)

### Infrastructure & Operations
*   **Containerization**: Docker (multi-stage builds for production)
*   **Orchestration**: Docker Compose (Dev, Test, Prod)
*   **Reverse Proxy / API Gateway**: Nginx (SSL, gzip, static caching)
*   **SSL/TLS**: OpenSSL (self-signed for development)
*   **Testing**: Pytest + HTTPX TestClient (51 automated tests)

---

## System Architecture

```mermaid
graph TB
    Client([Browser]) -->|HTTPS :443| Nginx

    subgraph "API Gateway (Nginx)"
        Nginx[Nginx Reverse Proxy]
    end

    subgraph "Frontend"
        Nginx -->|"/ (SPA)"| FE[React + Vite]
    end

    subgraph "Microservices"
        Nginx -->|"/users/*"| US[User Service :8000]
        Nginx -->|"/events/*"| ES[Event Service :8001]
        Nginx -->|"/register/*"| RS[Registration Service :8002]
        Nginx -->|"/notifications/*"| NS[Notification Service :8003]
    end

    subgraph "Data"
        US -.-> DB[(PostgreSQL)]
        ES -.-> DB
        RS -.-> DB
        NS -.-> DB
        US -.-> UF[/Profile Uploads/]
        ES -.-> EF[/Event Uploads/]
    end

    RS -->|"GET /events/{id}"| ES
    RS -->|"POST /notifications/send"| NS
```

---

## Detailed Sequence Diagrams

### 1. User Registration & Login Flow
```mermaid
sequenceDiagram
    participant C as Client (Browser)
    participant N as Nginx Gateway
    participant U as User Service
    participant DB as Database (users table)

    C->>N: POST /users/login
    N->>U: Proxy to User Service
    U->>DB: Query User by Username
    DB-->>U: Return hashed password
    U->>U: Verify hash match
    U->>U: Generate JWT (Signed with SECRET_KEY)
    U-->>N: Return {access_token, token_type}
    N-->>C: Return 200 OK + JWT
```

### 2. Event Creation & Security Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx Gateway
    participant E as Event Service
    participant DB as Database (events table)

    C->>N: POST /events/ (with Authorization: Bearer JWT)
    N->>E: Proxy to Event Service
    E->>E: Decode JWT locally using SECRET_KEY
    alt Invalid Signature
        E-->>C: 401 Unauthorized
    else Valid Signature
        E->>E: Extract user_id from JWT
        E->>DB: Insert into events table (organizer_id = user_id)
        DB-->>E: Return new event record
        E-->>C: 201 Created (Event Data)
    end
```

### 3. Event Image Upload Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx Gateway
    participant E as Event Service
    participant FS as File System
    participant DB as Database

    C->>N: POST /events/{id}/image (multipart/form-data)
    N->>E: Proxy (max 5MB body)
    E->>E: Verify JWT + ownership
    E->>E: Validate file (type, size ≤ 2MB)
    E->>FS: Write to /app/uploads/events/{filename}
    E->>DB: UPDATE events SET image_url = path
    E-->>C: 200 OK (updated event)

    Note over C,FS: Image served at /events/static/uploads/events/{filename}
```

### 4. Ticket Booking & Notification Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant R as Registration Service
    participant E as Event Service
    participant N as Notification Service
    participant DB as Database (registrations table)

    C->>R: POST /register/ {event_id: 5} + JWT
    R->>R: Verify JWT Token
    R->>E: HTTP GET /events/5 (Internal Request)
    E-->>R: Return event details (capacity: 100)

    R->>DB: Count current confirmed registrations for event 5
    DB-->>R: Count = 99

    R->>R: Check if 99 < 100 (Pass)
    R->>DB: Insert new registration record
    DB-->>R: Registration Created

    R->>N: HTTP POST /notifications/send + JWT
    N->>N: Verify JWT Token
    N->>N: Process Email Log (Mock send)
    N-->>R: 201 Notification Sent

    R-->>C: 201 Ticket Confirmed
```

---

## Nginx Routing Table

| Path | Backend | Strip Prefix | Notes |
|------|---------|-------------|-------|
| `/` | `frontend:3000` | No | SPA with WebSocket for Vite HMR |
| `/users/` | `user-service:8000` | Yes (`/users/me` → `/me`) | Includes static profile uploads |
| `/events/` | `event-service:8000` | Yes | Includes static event uploads |
| `/register/` | `registration-service:8000` | Yes | |
| `/notifications/` | `notification-service:8000` | Yes | |

---

## Shared Database Strategy

All four microservices share a single PostgreSQL instance (`evoradb`) but use isolated Alembic migration tracking:

| Service | Tables Owned | Alembic Version Table |
|---------|-------------|----------------------|
| User Service | `users` | `alembic_version` |
| Event Service | `events` | `event_alembic_version` |
| Registration Service | `registrations` | `registration_alembic_version` |
| Notification Service | `notifications` | `notification_alembic_version` |

> **Important**: When running `alembic autogenerate`, each service only detects changes to its own models. Cross-service table drops are prevented by isolated version tables.

---

## Security Model

| Aspect | Implementation |
|--------|---------------|
| **Authentication** | JWT (HS256) with shared SECRET_KEY |
| **Authorization** | Role-based (user, organizer, admin) |
| **Password Storage** | pbkdf2_sha256 (one-way hash) |
| **CORS** | Configured per-service |
| **SSL/TLS** | Nginx terminates HTTPS (self-signed dev, real certs for prod) |
| **File Upload Validation** | Type checking + 2MB size limit |
| **Ownership Checks** | Event modifications require `organizer_id == jwt.id` or admin role |
