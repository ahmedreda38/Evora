import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import EventForm from '../components/EventForm';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (payload) => {
    setLoading(true);
    try {
      await axios.post('/events/', payload);
      toast.success('Event created successfully! 🎉');
      navigate('/organizer');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create event');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/organizer" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-primary mb-2">Create New Event</h1>
          <p className="text-gray-500 mb-8">Fill in the details to create your event</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <EventForm onSubmit={handleCreate} submitLabel="Create Event" loading={loading} />
        </motion.div>
      </div>
    </div>
  );
}
