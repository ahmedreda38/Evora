import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, ArrowLeft, Users, Tag, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`/events/${id}`)
      .then(res => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error("Event not found");
        setLoading(false);
      });
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please log in to register for events");
      return;
    }
    
    setRegistering(true);
    try {
      await axios.post('/register/', {
        event_id: parseInt(id)
      });
      toast.success("Successfully registered for the event!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary text-xl">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">Event Not Found</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center text-primary hover:text-accent transition-colors font-medium">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Events
          </Link>
          <span className="font-bold text-2xl text-primary">EVORA<span className="text-accent">.</span></span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100"
        >
          <div className="h-64 bg-gradient-to-br from-primary to-secondary relative">
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-bold text-primary shadow-sm">
              {event.category}
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">{event.name}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
              </div>
              <div className="bg-surface p-6 rounded-2xl shrink-0 min-w-[200px] text-center border border-gray-100 shadow-sm">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Ticket Price</div>
                <div className="text-4xl font-black text-primary">
                  {event.price === 0 ? "Free" : `$${event.price.toFixed(2)}`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                <Calendar className="h-6 w-6 mr-4 text-accent" />
                <div>
                  <div className="text-sm text-gray-500">Date & Time</div>
                  <div className="font-medium">{new Date(event.start_date).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                <MapPin className="h-6 w-6 mr-4 text-accent" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{event.location}</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                <Users className="h-6 w-6 mr-4 text-accent" />
                <div>
                  <div className="text-sm text-gray-500">Capacity</div>
                  <div className="font-medium">{event.capacity} Attendees</div>
                </div>
              </div>
              <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                <Tag className="h-6 w-6 mr-4 text-accent" />
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium text-green-600">Published</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center pt-8 border-t border-gray-100">
              {user ? (
                <button 
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full md:w-auto bg-primary text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-[#005a63] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center"
                >
                  {registering ? "Processing..." : "Secure Your Ticket"}
                </button>
              ) : (
                <div className="text-center">
                  <p className="flex items-center text-gray-500 mb-4 justify-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-accent" />
                    You must be logged in to register
                  </p>
                  <Link to="/login" className="bg-surface text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors inline-block">
                    Sign In to Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
