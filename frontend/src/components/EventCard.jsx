import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventCard({ event, index = 0 }) {
  const navigate = useNavigate();

  const categoryColors = {
    'Technology': 'from-blue-500/20 to-cyan-500/30',
    'Conference': 'from-primary/20 to-secondary/40',
    'Workshop': 'from-amber-500/20 to-orange-500/30',
    'Healthcare': 'from-emerald-500/20 to-green-500/30',
    'Design': 'from-pink-500/20 to-rose-500/30',
    'Music': 'from-purple-500/20 to-violet-500/30',
    'Sports': 'from-red-500/20 to-orange-500/30',
    'Business': 'from-slate-500/20 to-gray-500/30',
  };

  const gradientClass = categoryColors[event.category] || 'from-primary/10 to-secondary/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      onClick={() => navigate(`/events/${event.id}`)}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:-translate-y-2 flex flex-col"
    >
      <div className="h-48 relative overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} group-hover:scale-110 transition-transform duration-700`}></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="text-8xl font-black text-primary select-none">{event.name?.charAt(0)}</span>
            </div>
          </>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary shadow-sm">
          {event.category || 'Event'}
        </div>
        {event.is_online && (
          <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
            🌐 Online
          </div>
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
          {event.name}
        </h3>
        <div className="space-y-2 mb-5 flex-grow">
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-2 text-secondary shrink-0" />
            <span>{new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2 text-secondary shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-200/60 mt-auto">
          <span className="text-2xl font-black text-primary">
            {event.price === 0 ? 'Free' : `$${Number(event.price).toFixed(2)}`}
          </span>
          <span className="bg-surface text-accent px-5 py-2 rounded-full font-bold text-sm group-hover:bg-accent group-hover:text-white transition-colors">
            Details
          </span>
        </div>
      </div>
    </motion.div>
  );
}
