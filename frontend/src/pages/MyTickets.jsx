import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, DollarSign, XCircle, ExternalLink, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function MyTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    axios.get('/register/me').then(async (res) => {
      const regs = Array.isArray(res.data) ? res.data : [];
      setRegistrations(regs);
      // Fetch event details for each registration
      const eventMap = {};
      await Promise.allSettled(
        [...new Set(regs.map(r => r.event_id))].map(eid =>
          axios.get(`/events/${eid}`).then(r => { eventMap[eid] = r.data; })
        )
      );
      setEvents(eventMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCancel = async (regId) => {
    setCancelling(regId);
    try {
      await axios.delete(`/register/${regId}`);
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'cancelled' } : r));
      toast.success('Registration cancelled');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel');
    } finally { setCancelling(null); }
  };

  const now = new Date();
  const filtered = registrations.filter(r => {
    const evt = events[r.event_id];
    const endDate = evt ? new Date(evt.end_date) : now;
    if (tab === 'upcoming') return r.status === 'confirmed' && endDate >= now;
    if (tab === 'past') return r.status === 'confirmed' && endDate < now;
    if (tab === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const totalSpent = registrations.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + (events[r.event_id]?.price || 0), 0);
  const activeCount = registrations.filter(r => r.status === 'confirmed').length;

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: registrations.filter(r => r.status === 'confirmed' && (events[r.event_id] ? new Date(events[r.event_id].end_date) >= now : true)).length },
    { key: 'past', label: 'Past', count: registrations.filter(r => r.status === 'confirmed' && events[r.event_id] && new Date(events[r.event_id].end_date) < now).length },
    { key: 'cancelled', label: 'Cancelled', count: registrations.filter(r => r.status === 'cancelled').length },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold text-primary mb-2">My Tickets</h1>
          <p className="text-gray-500 mb-8">Manage your event registrations and bookings</p>
        </motion.div>

        {/* Billing Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3"><div className="bg-primary/10 p-2.5 rounded-xl"><Ticket className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-gray-500">Total Bookings</p><p className="text-2xl font-black text-primary">{registrations.length}</p></div></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3"><div className="bg-green-50 p-2.5 rounded-xl"><DollarSign className="w-5 h-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Total Spent</p><p className="text-2xl font-black text-green-600">${totalSpent.toFixed(2)}</p></div></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3"><div className="bg-accent/10 p-2.5 rounded-xl"><Calendar className="w-5 h-5 text-accent" /></div><div><p className="text-xs text-gray-500">Active Tickets</p><p className="text-2xl font-black text-accent">{activeCount}</p></div></div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1.5 mb-6 shadow-sm border border-gray-100 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}>
              {t.label} <span className={`ml-1.5 text-xs ${tab === t.key ? 'text-white/70' : 'text-gray-400'}`}>({t.count})</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">{[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100"><div className="flex gap-4"><div className="w-16 h-16 bg-gray-200 rounded-xl"></div><div className="flex-1 space-y-2"><div className="h-5 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-100 rounded w-1/3"></div></div></div></div>
          ))}</div>
        )}

        {/* Ticket List */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((reg, idx) => {
              const evt = events[reg.event_id];
              const isFuture = evt && new Date(evt.end_date) >= now;
              return (
                <motion.div key={reg.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-2xl p-5 md:p-6 border shadow-sm transition-all hover:shadow-md ${reg.status === 'cancelled' ? 'border-red-100 opacity-70' : 'border-gray-100'}`}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Event color block */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-lg ${reg.status === 'cancelled' ? 'bg-gray-300' : 'bg-gradient-to-br from-primary to-secondary'}`}>
                      {evt?.name?.charAt(0) || '?'}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-primary text-lg truncate">{evt?.name || `Event #${reg.event_id}`}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
                        {evt && <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" />{new Date(evt.start_date).toLocaleDateString()}</span>}
                        {evt && <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{evt.location}</span>}
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />Booked {new Date(reg.registered_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {/* Price + Status */}
                    <div className="flex items-center gap-3 shrink-0">
                      {evt && <span className="text-lg font-black text-primary">{evt.price === 0 ? 'Free' : `$${evt.price.toFixed(2)}`}</span>}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${reg.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {reg.status}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/events/${reg.event_id}`} className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-primary transition-colors" title="View Event">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {reg.status === 'confirmed' && isFuture && (
                        <button onClick={() => handleCancel(reg.id)} disabled={cancelling === reg.id} className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Cancel">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6"><Ticket className="w-8 h-8 text-accent" /></div>
            <h3 className="text-lg font-bold text-primary mb-2">No {tab} tickets</h3>
            <p className="text-gray-500 mb-6">{tab === 'upcoming' ? 'Browse events to find your next experience!' : `You don't have any ${tab} tickets.`}</p>
            {tab === 'upcoming' && <Link to="/discover" className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-[#005a63] transition-colors">Discover Events</Link>}
          </motion.div>
        )}
      </div>
    </div>
  );
}
