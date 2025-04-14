
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    toast.error('You need admin privileges to access this page');
    return <Navigate to="/inbound" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
