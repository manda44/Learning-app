import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Check if user has a valid token
  if (!isAuthenticated()) {
    // Redirect to login if token is expired, invalid, or non-existent
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}
