import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, MapPin, DollarSign, Clock, Globe, Hash } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';

export default function ManageEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      axios.get(`/events/${id}`),
      axios.get(`/register/event/${id}`)
    ]).then(([evtRes, attRes]) => {
      if (evtRes.status === 'fulfilled') setEvent(evtRes.value.data);
      if (attRes.status === 'fulfilled') setAttendees(Array.isArray(attRes.value.data) ? attRes.value.data : []);
      setLoading(false);
    });
  }, [id]);

  const confirmed = attendees.filter(a => a.status === 'confirmed');
  const cancelled = attendees.filter(a => a.status === 'cancelled');
  const revenue = event ? confirmed.length * event.price : 0;
  const capacityPercent = event ? Math.round((confirmed.length / event.capacity) * 100) : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary text-xl">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">Event not found</div>;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/organizer" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>

          {/* Event Header */}
          <div className="bg-gradient-to-r from-primary to-[#005a63] rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${event.is_published ? 'bg-green-400/20 text-green-200' : 'bg-gray-400/20 text-gray-300'}`}>
                  {event.is_published ? 'Published' : 'Draft'}
                </span>
                {event.is_online && <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-400/20 text-blue-200 flex items-center"><Globe className="w-3 h-3 mr-1" /> Online</span>}
              </div>
              <h1 className="text-3xl font-extrabold mb-2">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" />{new Date(event.start_date).toLocaleDateString()} — {new Date(event.end_date).toLocaleDateString()}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" />{event.location}</span>
                <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1.5" />{event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Confirmed" value={confirmed.length} color="green" delay={0} />
          <StatCard icon={Hash} label="Cancelled" value={cancelled.length} color="accent" delay={1} />
          <StatCard icon={DollarSign} label="Revenue" value={`$${revenue.toFixed(0)}`} color="primary" delay={2} />
          <StatCard icon={Users} label="Capacity Used" value={`${capacityPercent}%`} color="blue" delay={3} />
        </div>

        {/* Capacity Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary">Capacity</h3>
            <span className="text-sm text-gray-500">{confirmed.length} / {event.capacity} attendees</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(capacityPercent, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${capacityPercent >= 90 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
            />
          </div>
        </motion.div>

        {/* Attendees Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-primary text-lg">Attendees ({attendees.length})</h3>
          </div>
          {attendees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Registered At</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((att, idx) => (
                    <tr key={att.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-primary">User #{att.user_id}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />{new Date(att.registered_at).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${att.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No attendees yet</p>
              <p className="text-sm text-gray-400 mt-1">Share your event to get registrations!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
