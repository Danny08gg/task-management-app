import { Navigate } from 'react-router-dom';
import pb from '../lib/pocketbase';

function ProtectedRoute({ children }) {
  console.log('Auth status:', pb.authStore.isValid);
  if (!pb.authStore.isValid) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default ProtectedRoute;