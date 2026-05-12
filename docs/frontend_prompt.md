# MEGA-PROMPT: Evora ReactJS Frontend Architecture & Design

**Context & Persona:**
Act as a Senior Frontend Architect and UI/UX Masterpiece Designer. Your goal is to build a modern, high-performance, and breathtakingly beautiful ReactJS application for "Evora" – a Microservices-based Event Management System. The backend API is fully built, containerized, and routed behind an Nginx Gateway.

**Core Tech Stack to Use:**
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS (configured with the custom color palette below)
- **State/Data Fetching:** React Query (TanStack Query) & Axios
- **Routing:** React Router DOM v6
- **Animations:** Framer Motion (for page transitions and micro-interactions)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

---

### 🎨 Design System & Color Palette
You MUST strictly adhere to this exact color palette and UI/UX philosophy. 

**Color Palette Configuration (Tailwind):**
- `primary`: `"#006d77"` (Deep Teal) - Use for headers, primary typography, active navigation states.
- `secondary`: `"#83c5be"` (Soft Seafoam) - Use for subtle gradients, hover states, and badges.
- `background`: `"#edf6f9"` (Ice White) - Use for the global app background.
- `surface`: `"#ffddd2"` (Soft Peach) - Use for card backgrounds, secondary sections, and input fields.
- `accent`: `"#e29578"` (Terracotta) - Use exclusively for Primary Call-to-Action (CTA) buttons, "Buy Ticket" buttons, and important alerts.

**Advanced UI/UX Principles to Implement:**
1. **Glassmorphism:** The top Navbar and sticky components should have a blur backdrop filter (`backdrop-blur-md` with `bg-white/70`).
2. **Micro-animations:** All buttons must have a `hover:scale-105 active:scale-95` transition. Event cards should float up slightly on hover with a soft drop shadow.
3. **Skeleton Loaders:** Do not use basic spinners. Use pulsing skeleton UI components while waiting for API data.
4. **Empty States:** Beautiful, illustrative empty states if a user has no events or tickets.
5. **Logo Placeholder:** Use a sleek, styled text placeholder `<div className="font-bold text-2xl tracking-tighter text-[#006d77]">EVORA<span className="text-[#e29578]">.</span></div>` in the navbar until the graphic logo is designed.

---

### 🗺️ Application Structure & Pages

The application must include the following structural layout and routes:

#### 1. Global Layout Component
- **Navbar:** Sticky top, Glassmorphism effect. Contains the Logo placeholder, Search bar, and dynamic links (Login/Signup if logged out; Dashboard/Profile avatar if logged in).
- **Footer:** Simple, clean, utilizing the `primary` Deep Teal color.

#### 2. The Landing Page (`/`)
- **Hero Section:** A massive, eye-catching gradient background blending `#edf6f9` into `#83c5be`. Large typography: "Discover Extraordinary Events". A prominent search bar allowing users to search by category or location.
- **Featured Events Section:** A responsive grid (1 col mobile, 3 cols desktop) of `EventCard` components fetching from `GET /events/` (published events only). 
- **Event Card Design:** Image placeholder at the top, Event Name (bold, Teal), Date & Location (gray text), Price tag (Terracotta pill), and a subtle hover lift effect.

#### 3. Authentication Pages (`/login`, `/register`)
- **Layout:** Split screen. Left side is a beautiful abstract illustration/gradient using the palette. Right side is the minimal, clean login/signup form floating on a `#ffddd2` tinted card.
- **Mechanics:** `POST` to `/users/login` (OAuth2 Form Data). Upon success, save the `access_token` to `localStorage` and redirect to the Dashboard.

#### 4. Event Details Page (`/events/:id`)
- **Hero Banner:** Full width, slightly darkened, with the Event Title and Date overlapping the bottom edge.
- **Content:** Two-column layout. 
  - *Left:* Rich description, organizer details, location map placeholder.
  - *Right (Sticky Ticket Box):* A floating card utilizing the `#ffddd2` background. Shows price, remaining capacity, and a massive, pulsing `#e29578` (Terracotta) "Book Ticket" button.
- **Action:** Clicking Book Ticket sends a `POST` to `/register/` (requires JWT token). Show a confetti effect or beautiful Toast on success.

#### 5. User Dashboard (`/dashboard`)
- **Tabbed Interface:** "My Tickets", "My Notifications".
- **My Tickets:** Fetches from `GET /register/me`. Displays a list of beautifully styled ticket stubs (perforated edge CSS effect if possible) showing the events the user is attending.
- **My Notifications:** Fetches from `GET /notifications/me`. Displays a clean list of system messages (e.g., "Booking Confirmed").

#### 6. Organizer Dashboard (`/organizer`) - *Protected Route*
- **Create Event Modal/Page:** Form to `POST /events/` with fields for Name, Category, Dates, Capacity, Price, and a toggle for `is_published`.
- **Manage Events:** Table view of events created by the user. Includes "Edit", "Delete", and "View Attendees" buttons.
- **Attendees List:** Clicking "View Attendees" fetches `GET /register/event/:id` and shows a list of users who bought tickets.

---

### 🔌 API Integration Rules
All API calls must be prefixed with the Nginx Gateway paths:
- Auth/Users: `http://localhost/users/...`
- Events: `http://localhost/events/...`
- Registration: `http://localhost/register/...`
- Notifications: `http://localhost/notifications/...`

You must create an `axios` interceptor that automatically attaches `Authorization: Bearer ${localStorage.getItem('token')}` to every request.

**Deliverables:**
Please provide the foundational Vite setup instructions, the Tailwind config for the color palette, the `axios` interceptor setup, and the complete React code for the **Landing Page**, the **Event Details Page**, and the **Global Navbar**. Focus heavily on the UI/UX polish!
