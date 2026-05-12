import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, ArrowRight, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';

function LandingPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Attempt to fetch real events from the microservice!
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
  const filteredEvents = displayEvents.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* GLASSMORPHISM NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="font-bold text-3xl tracking-tighter text-primary">
                EVORA<span className="text-accent">.</span>
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-primary hover:text-accent font-medium transition-colors">Discover</a>
              <a href="#" className="text-primary hover:text-accent font-medium transition-colors">Pricing</a>
              <a href="#" className="text-primary hover:text-accent font-medium transition-colors">For Organizers</a>
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" /> {user.username}
                  </span>
                  <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-primary font-medium hover:text-accent transition-colors">Sign In</Link>
                  <Link to="/register" className="bg-accent text-white px-6 py-2 rounded-full font-semibold hover:bg-[#d68566] hover:scale-105 active:scale-95 transition-all shadow-md">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-20 pb-32">
          {/* Abstract background shapes */}
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
                <button className="bg-primary text-white p-4 rounded-full hover:bg-[#005a63] hover:scale-105 transition-all shadow-md ml-2 flex items-center justify-center">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredEvents.map((evt, idx) => (
                <motion.div 
                  key={evt.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  onClick={() => navigate(`/events/${evt.id}`)}
                  className="bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:-translate-y-2 flex flex-col"
                >
                  <div className="h-56 bg-secondary/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/40 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary shadow-sm">
                      {evt.category || "Special Event"}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">{evt.name}</h3>
                    
                    <div className="space-y-2 mb-6 flex-grow">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-secondary" />
                        <span>{new Date(evt.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-secondary" />
                        <span>{evt.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200/60 mt-auto">
                      <span className="text-2xl font-black text-primary">
                        {evt.price === 0 ? "Free" : `$${evt.price.toFixed(2)}`}
                      </span>
                      <button className="bg-surface text-accent px-5 py-2 rounded-full font-bold hover:bg-accent hover:text-white transition-colors text-sm">
                        Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-lg">
                No events found matching your search.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-primary text-white/80 py-12 border-t-4 border-accent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-bold text-3xl tracking-tighter text-white mb-4 block">
              EVORA<span className="text-accent">.</span>
            </span>
            <p className="max-w-sm text-white/60 text-sm">
              The world's premier microservice-based event management system. Built with FastAPI, React, and maximum architectural elegance.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Browse Events</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Create Event</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/events/:id" element={<EventDetails />} />
    </Routes>
  );
}

export default App;
