import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Clock, Mail } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/notifications/me')
      .then(res => { setNotifications(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* Endpoint may not exist yet — gracefully ignore */ }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.allSettled(unread.map(n => axios.put(`/notifications/${n.id}/read`)));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  // Group by date
  const grouped = notifications.reduce((acc, n) => {
    const date = new Date(n.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {});

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-primary">Notifications</h1>
            <p className="text-gray-500 mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center text-sm font-semibold text-accent hover:text-[#d68566] transition-colors">
              <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
            </button>
          )}
        </motion.div>

        {loading && (
          <div className="space-y-4">{[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
              <div className="flex gap-4"><div className="w-10 h-10 bg-gray-200 rounded-xl"></div><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-1/3"></div><div className="h-3 bg-gray-100 rounded w-2/3"></div></div></div>
            </div>
          ))}</div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">{date}</h3>
                <div className="space-y-2">
                  {items.map((n, idx) => (
                    <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                      className={`bg-white rounded-2xl p-5 border shadow-sm transition-all cursor-pointer hover:shadow-md ${
                        n.is_read ? 'border-gray-100 opacity-70' : 'border-l-4 border-l-accent border-t border-r border-b border-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl shrink-0 ${n.is_read ? 'bg-gray-100' : 'bg-accent/10'}`}>
                          <Mail className={`w-5 h-5 ${n.is_read ? 'text-gray-400' : 'text-accent'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-semibold truncate ${n.is_read ? 'text-gray-500' : 'text-primary'}`}>{n.subject}</h4>
                            {!n.is_read && <span className="w-2.5 h-2.5 bg-accent rounded-full shrink-0 mt-1.5"></span>}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(n.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6"><Bell className="w-8 h-8 text-accent" /></div>
            <h3 className="text-lg font-bold text-primary mb-2">No notifications yet</h3>
            <p className="text-gray-500">You'll see booking confirmations and updates here.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
