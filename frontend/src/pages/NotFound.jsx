import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl font-black text-primary/10 mb-4 select-none">404</div>
        <h1 className="text-3xl font-extrabold text-primary mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-[#005a63] transition-all inline-flex items-center shadow-md"
          >
            <Home className="w-4 h-4 mr-2" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-full font-medium text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
