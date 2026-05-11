# Evora Cloud Project - Microservices Architecture

## Project Overview

Evora is a microservices-based event management platform built with **FastAPI**, **PostgreSQL**, and **Docker**. The system handles user management, event management, event registrations, and notifications through independent, scalable microservices.

---

## Project Structure

```
cloud-project/
├── docker-compose.dev.yml      # Orchestration for local development
├── docker-compose.test.yml     # Orchestration for running automated tests
├── docker-compose.prod.yml     # Orchestration for production deployment
├── envy/                        # Python virtual environment
├── user-service/               # User management microservice (Complete)
│   ├── README.md              # Service-specific documentation
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── routes.py
│   ├── schema.py
│   ├── crud.py
│   ├── auth.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── create_tables.py
├── event-service/              # Event management microservice (Coming Soon)
├── event-registration-service/ # Event registration handling (Coming Soon)
├── notifications-emailing-service/ # Notifications service (Coming Soon)
└── api-gateway/               # API Gateway (Coming Soon)
```

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

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Python 3.13+ (for local development)
- Git

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd /home/kali/studies/cloud-project

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb
SECRET_KEY=your_super_secret_key_here_change_in_production
EOF

# Start services
docker compose -f docker-compose.dev.yml up -d postgres-db user-service

# View logs
docker compose -f docker-compose.dev.yml logs -f user-service

# Access API documentation
# Open: http://localhost:8000/docs
```

### Option 2: Local Development

```bash
# Navigate to project root
cd /home/kali/studies/cloud-project

# Activate virtual environment
source envy/bin/activate

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql+psycopg2://db_admin:evora123@localhost:5432/evoradb
SECRET_KEY=your_super_secret_key_here
EOF

# Start PostgreSQL only
docker compose up -d postgres-db

# Install dependencies
pip install -r user-service/requirements.txt

# Initialize database tables
cd user-service
python create_tables.py
cd ..

# Run user service
source envy/bin/activate
cd user-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Development Environment Setup

### Step 1: Clone & Navigate
```bash
cd /home/kali/studies/cloud-project
```

### Step 2: Create Environment File
Create a `.env` file in the project root with required environment variables. Each service may have additional variables - check individual service README files.

```env
DATABASE_URL=postgresql+psycopg2://db_admin:evora123@postgres-db:5432/evoradb
SECRET_KEY=your_secret_key_here
```

### Step 3: Setup Virtual Environment
```bash
# Activate existing virtual environment
source envy/bin/activate

# Or create new one if needed
python -m venv envy
source envy/bin/activate
```

### Step 4: Install Service Dependencies
```bash
# For user service
pip install -r user-service/requirements.txt

# For other services (as needed)
pip install -r event-service/requirements.txt
```

---

## Running Services

### Docker Compose Environments

This project uses three separate Docker Compose files:
1. **Development (`docker-compose.dev.yml`)**: Includes volume mounts for hot-reloading code without rebuilding images. Database ports are exposed.
2. **Testing (`docker-compose.test.yml`)**: Uses an isolated database (`evoradb_test`) and overrides commands to run test suites.
3. **Production (`docker-compose.prod.yml`)**: Optimized for deployment. No volume mounts, no exposed database ports, and includes `restart: always`.

### All Services with Docker Compose (Development)
```bash
# Start all services
docker compose -f docker-compose.dev.yml up -d

# Stop all services
docker compose -f docker-compose.dev.yml down

# View logs for specific service
docker compose -f docker-compose.dev.yml logs -f user-service

# Rebuild services
docker compose -f docker-compose.dev.yml build --no-cache
```

### Individual Services with Docker Compose
```bash
# Start only specific services
docker compose -f docker-compose.dev.yml up -d postgres-db user-service

# Stop specific service
docker compose -f docker-compose.dev.yml stop user-service

# Restart service
docker compose -f docker-compose.dev.yml restart user-service
```

### Local Development Mode
```bash
# Start database only
docker compose -f docker-compose.dev.yml up -d postgres-db

# From service directory, run with hot-reload
cd user-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Service Documentation

Each microservice has its own README with service-specific details:

- **[User Service](./user-service/README.md)** - User management, authentication, JWT
- **[Event Service](./event-service/README.md)** - Event CRUD operations (coming soon)
- **[Event Registration Service](./event-registration-service/README.md)** - Registration management (coming soon)
- **[Notifications Service](./notifications-emailing-service/README.md)** - Email notifications (coming soon)

---

## File Structure for Each Microservice

When creating a new microservice, follow this structure:

```
service-name/
├── README.md               # Service documentation
├── main.py               # FastAPI app initialization
├── models.py             # SQLAlchemy ORM models
├── schema.py             # Pydantic request/response schemas
├── database.py           # DB connection & session management
├── crud.py               # Database CRUD operations
├── routes.py             # API endpoints
├── auth.py               # Authentication/Authorization logic
├── requirements.txt      # Python dependencies
├── Dockerfile            # Docker container config
└── create_tables.py      # Database table initialization
```

---

## Common Commands

```bash
# Docker Compose Commands
docker compose -f docker-compose.dev.yml up -d                    # Start all services in background
docker compose -f docker-compose.dev.yml down                     # Stop all services
docker compose -f docker-compose.dev.yml logs -f [service]        # View service logs
docker compose -f docker-compose.dev.yml exec [service] bash      # Execute bash in service
docker compose -f docker-compose.dev.yml build --no-cache         # Rebuild all images
docker compose -f docker-compose.dev.yml down -v                  # Stop and remove volumes

# Database Access
docker exec -it evora-db psql -U db_admin -d evoradb

# View running containers
docker ps

# View all containers
docker ps -a
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find service using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Container Network Issues
```bash
# Ensure containers are on same network
docker network ls
docker network inspect evora-net

# Recreate network
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d
```

### Database Connection Issues
# Ensure PostgreSQL container is running: `docker compose -f docker-compose.dev.yml ps`
- Check DATABASE_URL in .env file
- Verify credentials match docker-compose.yml

---

## Development Guidelines

### Before Pushing Code
- [ ] All services have Dockerfile
- [ ] All services have requirements.txt
- [ ] Environment variables documented in service README
- [ ] Code tested locally
- [ ] No hardcoded secrets in code

### Code Review Checklist
- [ ] Code follows project structure
- [ ] Environment variables properly configured
- [ ] API endpoints documented
- [ ] Dependencies added to requirements.txt
- [ ] No breaking changes to existing APIs

### Git Workflow
```bash
# Feature branch development
git checkout -b feature/service-name

# Before pushing
git pull origin develop
git merge develop

# Create pull request to develop branch
```

---

## Project Roadmap

| Phase | Status | Services |
|-------|--------|----------|
| Phase 1 | ✓ Complete | User Service |
| Phase 2 | In Planning | Event Service, Event Registration |
| Phase 3 | In Planning | Notifications Service |
| Phase 4 | In Planning | API Gateway |

---

## Environment Variables

### Required for All Services
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key

### Service-Specific Variables
Refer to individual service README files for service-specific environment variables.

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
- [PyJWT](https://pyjwt.readthedocs.io/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Support

For issues or questions:
1. Check the relevant service README
2. Review common troubleshooting section
3. Check Docker logs: `docker compose -f docker-compose.dev.yml logs -f [service]`
4. Contact the team lead

**Last Updated**: May 9, 2026
