# Evora — Database Schema (Implemented)

This diagram shows the **actual implemented** database tables currently deployed in the shared PostgreSQL instance (`evoradb`).

```mermaid
erDiagram

    USER {
        int id PK
        string username UK
        string email UK
        string password_hash
        string role "user | organizer | admin"
        boolean is_active
        string profile_image_url "nullable"
        datetime date_joined
        datetime updated_at
    }

    EVENT {
        int id PK
        int organizer_id "references user.id"
        string name
        string category
        text description
        string location
        boolean is_online
        datetime start_date
        datetime end_date
        int capacity
        float price
        boolean is_published
        string image_url "nullable"
        datetime created_at
        datetime updated_at
    }

    REGISTRATION {
        int id PK
        int user_id "references user.id"
        int event_id "references event.id"
        string status "confirmed | cancelled"
        datetime registered_at
    }

    NOTIFICATION {
        int id PK
        int sender_id "references user.id"
        int receiver_id "references user.id"
        string message
        boolean is_read
        datetime created_at
    }

    USER ||--o{ EVENT : organizes
    USER ||--o{ REGISTRATION : registers_for
    EVENT ||--o{ REGISTRATION : has_registrations
    USER ||--o{ NOTIFICATION : sends
    USER ||--o{ NOTIFICATION : receives
```

## Table Ownership

Each microservice exclusively manages its own table(s) through isolated Alembic migrations:

| Service | Table | Alembic Version Table |
|---------|-------|-----------------------|
| User Service | `users` | `alembic_version` |
| Event Service | `events` | `event_alembic_version` |
| Registration Service | `registrations` | `registration_alembic_version` |
| Notification Service | `notifications` | `notification_alembic_version` |

## Cross-Service References

All cross-service references (e.g., `events.organizer_id → users.id`) are **logical references only** — there are no physical foreign key constraints across services. This preserves microservice independence and allows each service to be deployed, scaled, or migrated independently.