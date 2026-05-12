# Evora Architecture & Tech Stack

## Complete Tech Stack
### Backend Services
*   **Framework**: FastAPI (Python 3.13+)
*   **Application Server**: Uvicorn
*   **Data Validation**: Pydantic v2
*   **Authentication**: PyJWT (HS256)
*   **HTTP Client**: HTTPX (for synchronous internal inter-service calls)
*   **Password Hashing**: Passlib (pbkdf2_sha256)

### Database Layer
*   **RDBMS**: PostgreSQL 18
*   **ORM**: SQLAlchemy 2.0
*   **Migrations**: Alembic (Isolated via custom `version_table` and `include_name` filters per microservice to allow multiple services to share the same physical database instance securely)

### Infrastructure & Operations
*   **Containerization**: Docker
*   **Orchestration**: Docker Compose (Dev, Test, Prod variations)
*   **Reverse Proxy / API Gateway**: Nginx
*   **SSL/TLS**: OpenSSL (Self-signed for Dev)

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

### 3. Ticket Booking & Notification Flow (Complex Intersection)
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
