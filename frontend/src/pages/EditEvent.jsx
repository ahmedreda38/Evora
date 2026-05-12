import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import EventForm from '../components/EventForm';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`/events/${id}`)
      .then(res => { setEvent(res.data); setLoading(false); })
      .catch(() => { toast.error('Event not found'); navigate('/organizer'); });
  }, [id, navigate]);

  const handleUpdate = async (payload) => {
    setSaving(true);
    try {
      await axios.put(`/events/${id}`, payload);
      toast.success('Event updated successfully!');
      navigate('/organizer');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update event');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/organizer" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-primary mb-2">Edit Event</h1>
          <p className="text-gray-500 mb-8">Update your event details</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <EventForm initialData={event} onSubmit={handleUpdate} submitLabel="Save Changes" loading={saving} />
        </motion.div>
      </div>
    </div>
  );
}
