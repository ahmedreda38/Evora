import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Award, Ticket, DollarSign, Clock, Save, Sparkles, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({ events_registered: 0, events_organized: 0, total_spent: 0, member_since_days: 0 });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username || '', email: user.email || '', password: '' });
      // Calculate member since days
      const joined = new Date(user.date_joined);
      const days = Math.floor((Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24));
      setStats(s => ({ ...s, member_since_days: days }));
    }
    // Fetch stats (registrations)
    axios.get('/register/me').then(res => {
      const regs = Array.isArray(res.data) ? res.data : [];
      const confirmed = regs.filter(r => r.status === 'confirmed');
      setStats(s => ({ ...s, events_registered: confirmed.length }));
    }).catch(() => {});
    // Fetch organized events
    if (user?.id) {
      axios.get(`/events/search/organizer/${user.id}`).then(res => {
        const evts = Array.isArray(res.data) ? res.data : [];
        setStats(s => ({ ...s, events_organized: evts.length }));
      }).catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { username: formData.username, email: formData.email };
      if (formData.password) payload.password = formData.password;
      await axios.put('/users/me', payload);
      if (updateUser) await updateUser();
      toast.success('Profile updated successfully!');
      setEditing(false);
      setFormData(f => ({ ...f, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await axios.put('/users/me/role', { requested_role: 'organizer' });
      if (updateUser) await updateUser();
      toast.success('You are now an Organizer! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upgrade failed');
    } finally { setUpgrading(false); }
  };

  const roleBadge = (role) => {
    const map = {
      admin: 'bg-red-100 text-red-700',
      organizer: 'bg-purple-100 text-purple-700',
      user: 'bg-blue-100 text-blue-700',
    };
    return map[role] || map.user;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-primary to-[#005a63] rounded-3xl p-8 md:p-12 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black uppercase border border-white/30 shadow-lg">
              {user?.username?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold mb-1">{user?.username}</h1>
              <p className="text-white/70 flex items-center"><Mail className="w-4 h-4 mr-2" />{user?.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`${roleBadge(user?.role)} px-3 py-1 rounded-full text-xs font-bold uppercase`}>{user?.role}</span>
                <span className="text-white/50 text-sm flex items-center"><Clock className="w-3 h-3 mr-1" /> Joined {new Date(user?.date_joined).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Ticket} label="Registered" value={stats.events_registered} color="primary" delay={0} />
          <StatCard icon={Award} label="Organized" value={stats.events_organized} color="purple" delay={1} />
          <StatCard icon={DollarSign} label="Total Spent" value={`$${stats.total_spent.toFixed(0)}`} color="green" delay={2} />
          <StatCard icon={Calendar} label="Days Active" value={stats.member_since_days} color="blue" delay={3} />
        </div>

        {/* Account Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary flex items-center"><User className="w-5 h-5 mr-2" /> Account Settings</h2>
            {!editing && <button onClick={() => setEditing(true)} className="text-sm text-accent hover:text-[#d68566] font-semibold">Edit Profile</button>}
          </div>
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">New Password <span className="text-gray-400">(leave blank to keep current)</span></label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="••••••••" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#005a63] transition-colors disabled:opacity-50 flex items-center"><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => { setEditing(false); setFormData({ username: user.username, email: user.email, password: '' }); }} className="px-6 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center py-3 border-b border-gray-50"><span className="text-sm text-gray-500 w-32">Username</span><span className="font-medium text-primary">{user?.username}</span></div>
              <div className="flex items-center py-3 border-b border-gray-50"><span className="text-sm text-gray-500 w-32">Email</span><span className="font-medium text-primary">{user?.email}</span></div>
              <div className="flex items-center py-3 border-b border-gray-50"><span className="text-sm text-gray-500 w-32">Role</span><span className={`${roleBadge(user?.role)} px-3 py-1 rounded-full text-xs font-bold uppercase`}>{user?.role}</span></div>
              <div className="flex items-center py-3"><span className="text-sm text-gray-500 w-32">Password</span><span className="text-gray-400">••••••••</span></div>
            </div>
          )}
        </motion.div>

        {/* Become Organizer CTA */}
        {user?.role === 'user' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-purple-50 to-surface rounded-2xl p-6 md:p-8 border border-purple-100 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary mb-1">Become an Organizer</h3>
                <p className="text-gray-600 text-sm">Create and manage your own events, track attendees, and build your audience on Evora.</p>
              </div>
              <button onClick={handleUpgrade} disabled={upgrading} className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 shrink-0 shadow-md hover:shadow-lg">
                {upgrading ? 'Upgrading...' : 'Upgrade Now'}
              </button>
            </div>
          </motion.div>
        )}

        {user?.role === 'organizer' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-8">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-bold text-green-800">You're an Organizer!</h3>
                <p className="text-green-600 text-sm">Head to your <a href="/organizer" className="underline font-semibold">Organizer Dashboard</a> to create and manage events.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
