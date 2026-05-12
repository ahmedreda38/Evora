import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X, Compass, Ticket, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`font-medium transition-colors ${
        location.pathname === to
          ? 'text-accent'
          : 'text-primary hover:text-accent'
      }`}
      onClick={() => setMobileOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* GLASSMORPHISM NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="font-bold text-3xl tracking-tighter text-primary">
                EVORA<span className="text-accent">.</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLink('/discover', 'Discover')}
              {user && navLink('/my-tickets', 'My Tickets')}
              {isOrganizer && navLink('/organizer', 'Organizer')}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <NotificationBell />
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 bg-surface/60 hover:bg-surface px-4 py-2 rounded-full transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user.username?.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-primary">{user.username}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-primary font-medium hover:text-accent transition-colors">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-accent text-white px-6 py-2 rounded-full font-semibold hover:bg-[#d68566] hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/discover" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface/40 transition-colors">
                  <Compass className="w-5 h-5 text-accent" />
                  <span className="font-medium text-primary">Discover</span>
                </Link>
                {user && (
                  <>
                    <Link to="/my-tickets" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface/40 transition-colors">
                      <Ticket className="w-5 h-5 text-accent" />
                      <span className="font-medium text-primary">My Tickets</span>
                    </Link>
                    <Link to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface/40 transition-colors">
                      <NotificationBell mobile />
                      <span className="font-medium text-primary">Notifications</span>
                    </Link>
                    {isOrganizer && (
                      <Link to="/organizer" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface/40 transition-colors">
                        <LayoutDashboard className="w-5 h-5 text-accent" />
                        <span className="font-medium text-primary">Organizer</span>
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface/40 transition-colors">
                      <UserIcon className="w-5 h-5 text-accent" />
                      <span className="font-medium text-primary">Profile</span>
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-red-500">Logout</span>
                    </button>
                  </>
                )}
                {!user && (
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="text-center py-3 text-primary font-medium hover:text-accent transition-colors">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="text-center bg-accent text-white py-3 rounded-full font-semibold hover:bg-[#d68566] transition-all shadow-md">
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-grow">
        <Outlet />
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
              <li><Link to="/discover" className="hover:text-white transition-colors">Browse Events</Link></li>
              <li><Link to={isOrganizer ? "/organizer/create" : "/profile"} className="hover:text-white transition-colors">Create Event</Link></li>
              <li><Link to="/my-tickets" className="hover:text-white transition-colors">My Tickets</Link></li>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          © 2026 Evora. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
