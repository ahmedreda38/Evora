# Evora Frontend — React SPA

## Overview

The Evora frontend is a **React 18 Single Page Application** built with Vite 5. It provides a modern, responsive interface for event discovery, management, user profiles, and organizer dashboards.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| TailwindCSS 3 | Utility-first styling |
| Framer Motion | Animations & transitions |
| React Router v6 | Client-side routing |
| Axios | HTTP client (with JWT interceptor) |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero section, featured events, CTA |
| Discover | `/discover` | Browse & search all events |
| Event Detail | `/events/:id` | Event info, registration button |
| Login | `/login` | User authentication |
| Register | `/register` | New user signup |
| Profile | `/profile` | Stats, settings, avatar upload, role upgrade |
| Organizer Dashboard | `/organizer` | Event management for organizers |
| Create Event | `/organizer/create` | Event creation form with image upload |
| Edit Event | `/organizer/edit/:id` | Edit existing event |
| My Bookings | `/bookings` | Registration history |

---

## Running

### Development (via Docker Compose)
```bash
# From project root — starts with hot-reload
docker compose -f docker-compose.dev.yml up -d frontend

# Access at https://evora.com (requires hosts entry)
```

### Local Development
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:3000
```

### Production Build
```bash
# Multi-stage Docker build (React build → nginx:alpine ~30MB)
docker build -f Dockerfile.prod -t evora-frontend:prod .
```

---

## Features

- **JWT Auth Context** — Persistent login state with auto-refresh
- **Protected Routes** — Redirect unauthenticated users to login
- **Image Uploads** — Drag-and-drop event images, clickable avatar upload
- **Responsive Design** — Mobile-first TailwindCSS layout
- **Micro-animations** — Framer Motion page transitions and hover effects
- **Toast Notifications** — Success/error feedback for all actions

---

## File Structure

```
frontend/
├── Dockerfile           # Dev image (node:20-alpine)
├── Dockerfile.prod      # Multi-stage prod (build → nginx:alpine)
├── .dockerignore        # Excludes node_modules from build context
├── vite.config.js       # Proxy config for API services
├── tailwind.config.js   # TailwindCSS configuration
├── index.html           # Entry point
└── src/
    ├── main.jsx         # React root + router
    ├── App.jsx          # Route definitions
    ├── index.css        # Global styles + Tailwind directives
    ├── context/
    │   └── AuthContext.jsx    # JWT auth state management
    ├── pages/
    │   ├── Landing.jsx        # Home page
    │   ├── Discover.jsx       # Event browser
    │   ├── EventDetail.jsx    # Single event view
    │   ├── Login.jsx          # Login form
    │   ├── Register.jsx       # Signup form
    │   ├── Profile.jsx        # User profile + avatar upload
    │   ├── OrganizerDash.jsx  # Organizer dashboard
    │   ├── CreateEvent.jsx    # New event form
    │   ├── EditEvent.jsx      # Edit event form
    │   └── MyBookings.jsx     # Booking history
    └── components/
        ├── Navbar.jsx         # Navigation bar
        ├── EventCard.jsx      # Event card (image support)
        ├── EventForm.jsx      # Event form (with image upload)
        └── StatCard.jsx       # Profile stat card
```

---

**Last Updated**: May 12, 2026
