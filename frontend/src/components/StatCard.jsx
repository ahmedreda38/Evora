import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color = 'primary', delay = 0 }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    secondary: 'bg-secondary/10 text-primary',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  const iconColorMap = {
    primary: 'bg-primary text-white',
    accent: 'bg-accent text-white',
    secondary: 'bg-secondary text-primary',
    green: 'bg-emerald-500 text-white',
    purple: 'bg-purple-500 text-white',
    blue: 'bg-blue-500 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`${colorMap[color]} p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex items-center space-x-4">
        <div className={`${iconColorMap[color]} p-3 rounded-xl shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-70">{label}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
