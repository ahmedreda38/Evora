import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import EventCard from './components/EventCard';

// Layout & Guards
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import OrganizerGuard from './components/OrganizerGuard';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import MyTickets from './pages/MyTickets';
import Notifications from './pages/Notifications';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import ManageEvent from './pages/ManageEvent';
import NotFound from './pages/NotFound';

function LandingPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/events/')
      .then(res => setEvents(res.data))
      .catch(err => console.log("Backend not populated yet, using fallbacks", err));
  }, []);

  const fallbackData = [
    { id: 1, name: "Global Tech Summit 2026", start_date: "2026-08-15T09:00:00", location: "San Francisco, CA", price: 299.00, capacity: 500, category: "Technology" },
    { id: 2, name: "Design Leadership Workshop", start_date: "2026-09-10T10:00:00", location: "New York, NY", price: 149.00, capacity: 50, category: "Design" },
    { id: 3, name: "AI in Healthcare Symposium", start_date: "2026-10-05T08:30:00", location: "London, UK", price: 0.00, capacity: 200, category: "Healthcare" },
  ];

  const displayEvents = Array.isArray(events) && events.length > 0 ? events : fallbackData;
  const filteredEvents = displayEvents.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-surface rounded-[100%] blur-3xl opacity-60 mix-blend-multiply transform -rotate-12 scale-150"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-primary tracking-tight mb-6">
              Discover Extraordinary <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#005a63]">Experiences.</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              The ultimate platform to host, manage, and book tickets for the world's most exclusive events.
            </p>

            {/* SEARCH BAR */}
            <div className="max-w-3xl mx-auto bg-white p-2 rounded-full shadow-xl flex items-center border border-gray-100">
              <div className="flex-1 flex items-center pl-6 border-r border-gray-200">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search events, categories..."
                  className="w-full bg-transparent focus:outline-none text-gray-700 py-3"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="hidden md:flex flex-1 items-center pl-6">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <input type="text" placeholder="Location" className="w-full bg-transparent focus:outline-none text-gray-700 py-3" />
              </div>
              <button
                onClick={() => navigate('/discover')}
                className="bg-primary text-white p-4 rounded-full hover:bg-[#005a63] hover:scale-105 transition-all shadow-md ml-2 flex items-center justify-center"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED EVENTS GRID */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-primary">Trending Now</h2>
              <p className="text-gray-500 mt-2">Secure your spot at the most anticipated events.</p>
            </div>
            <Link to="/discover" className="hidden sm:flex items-center text-accent hover:text-[#d68566] font-semibold transition-colors">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredEvents.slice(0, 6).map((evt, idx) => (
              <EventCard key={evt.id} event={evt} index={idx} />
            ))}
          </div>
          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-lg">
              No events found matching your search.
            </div>
          )}

          {/* Mobile View All */}
          <div className="sm:hidden text-center mt-8">
            <Link to="/discover" className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-[#005a63] transition-colors inline-flex items-center">
              View All Events <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-4">Ready to Host Your Own Event?</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of organizers using Evora to create, manage, and sell tickets for extraordinary experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="bg-accent text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#d68566] hover:scale-105 active:scale-95 transition-all shadow-lg">
                Get Started Free
              </Link>
              <Link to="/discover" className="text-primary font-semibold hover:text-accent transition-colors inline-flex items-center">
                Explore Events <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function App() {
  return (
    <Routes>
      {/* Public pages wrapped in Layout (shared Navbar + Footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/events/:id" element={<EventDetails />} />

        {/* Protected pages (require auth) */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* Organizer pages (require organizer role) */}
        <Route path="/organizer" element={<OrganizerGuard><OrganizerDashboard /></OrganizerGuard>} />
        <Route path="/organizer/create" element={<OrganizerGuard><CreateEvent /></OrganizerGuard>} />
        <Route path="/organizer/edit/:id" element={<OrganizerGuard><EditEvent /></OrganizerGuard>} />
        <Route path="/organizer/events/:id" element={<OrganizerGuard><ManageEvent /></OrganizerGuard>} />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth pages (no shared layout — standalone) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
