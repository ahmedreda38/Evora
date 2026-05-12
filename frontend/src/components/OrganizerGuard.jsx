import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function OrganizerGuard({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'organizer' && user.role !== 'admin') {
    toast.error('You need to be an organizer to access this page');
    return <Navigate to="/profile" replace />;
  }

  return children;
}
