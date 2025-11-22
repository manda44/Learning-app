import { Navigate } from 'react-router-dom';
import { isAuthenticated, isStudent } from '../src/services/authService';
import { Center, Loader } from '@mantine/core';
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that checks authentication and role-based access for students
 * Restricts access to users with Student role only
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    // Check role-based access for Student role
    if (!isStudent()) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Center mih="100vh">
        <Loader />
      </Center>
    );
  }

  // If not authenticated or not authorized, redirect to login
  if (!isAuthorized) {
    return <Navigate to="/auth/login" replace />;
  }

  // If authorized, render the protected content
  return <>{children}</>;
}
