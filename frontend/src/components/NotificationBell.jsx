import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function NotificationBell({ mobile = false }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCount = () => {
      axios.get('/notifications/me/unread-count')
        .then(res => setUnreadCount(res.data.count || 0))
        .catch(() => setUnreadCount(0));
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  if (mobile) {
    return <Bell className="w-5 h-5 text-accent" />;
  }

  return (
    <Link
      to="/notifications"
      className="relative p-2 rounded-full hover:bg-surface/60 transition-colors"
      title="Notifications"
    >
      <Bell className="w-5 h-5 text-primary" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 shadow-sm animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
