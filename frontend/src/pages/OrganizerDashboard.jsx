import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, Eye, EyeOff, Edit3, Trash2, BarChart3, Globe } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`/events/search/organizer/${user.id}`)
      .then(res => { setEvents(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setDeleting(eventId);
    try {
      await axios.delete(`/events/${eventId}`);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    } finally { setDeleting(null); }
  };

  const togglePublish = async (event) => {
    try {
      await axios.put(`/events/${event.id}`, { is_published: !event.is_published });
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_published: !e.is_published } : e));
      toast.success(event.is_published ? 'Event unpublished' : 'Event published!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  const published = events.filter(e => e.is_published).length;
  const drafts = events.filter(e => !e.is_published).length;
  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-primary">Organizer Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your events and track performance</p>
          </div>
          <Link to="/organizer/create" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005a63] transition-all shadow-md hover:shadow-lg inline-flex items-center hover:scale-[1.02] active:scale-95">
            <Plus className="w-5 h-5 mr-2" /> Create Event
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar} label="Total Events" value={events.length} color="primary" delay={0} />
          <StatCard icon={Eye} label="Published" value={published} color="green" delay={1} />
          <StatCard icon={EyeOff} label="Drafts" value={drafts} color="accent" delay={2} />
          <StatCard icon={Users} label="Total Capacity" value={totalCapacity} color="blue" delay={3} />
        </div>

        {/* Events List */}
        {loading && (
          <div className="space-y-4">{[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
              <div className="flex gap-4"><div className="w-12 h-12 bg-gray-200 rounded-xl"></div><div className="flex-1 space-y-2"><div className="h-5 bg-gray-200 rounded w-1/3"></div><div className="h-4 bg-gray-100 rounded w-1/4"></div></div></div>
            </div>
          ))}</div>
        )}

        {!loading && events.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500">Event</th>
                    <th className="text-left px-4 py-4 text-sm font-semibold text-gray-500 hidden md:table-cell">Date</th>
                    <th className="text-left px-4 py-4 text-sm font-semibold text-gray-500 hidden lg:table-cell">Capacity</th>
                    <th className="text-left px-4 py-4 text-sm font-semibold text-gray-500 hidden md:table-cell">Price</th>
                    <th className="text-center px-4 py-4 text-sm font-semibold text-gray-500">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt, idx) => (
                    <motion.tr key={evt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {evt.name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-primary truncate max-w-[200px]">{evt.name}</p>
                            <p className="text-xs text-gray-400">{evt.category} {evt.is_online && <Globe className="w-3 h-3 inline ml-1" />}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">{new Date(evt.start_date).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">{evt.capacity}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-primary hidden md:table-cell">{evt.price === 0 ? 'Free' : `$${evt.price.toFixed(2)}`}</td>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => togglePublish(evt)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${evt.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {evt.is_published ? 'Live' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/organizer/events/${evt.id}`)} className="p-2 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors" title="Manage">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/organizer/edit/${evt.id}`)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(evt.id)} disabled={deleting === evt.id} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && events.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6"><Calendar className="w-8 h-8 text-accent" /></div>
            <h3 className="text-lg font-bold text-primary mb-2">No events yet</h3>
            <p className="text-gray-500 mb-6">Create your first event and start building your audience!</p>
            <Link to="/organizer/create" className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-[#005a63] transition-colors inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Create Your First Event
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
