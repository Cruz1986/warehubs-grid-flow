
import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface FacilityAccessGuardProps {
  children: React.ReactNode;
  allowedFacility: string;
}

const FacilityAccessGuard: React.FC<FacilityAccessGuardProps> = ({ 
  children, 
  allowedFacility 
}) => {
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Check if user has access to this facility
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isManager = user?.role?.toLowerCase() === 'manager';
  const hasAllFacilities = user?.facility === 'All';
  const hasSpecificFacility = user?.facility === allowedFacility;
  
  // Enhanced access check - ensures both Supabase users and local users work
  const hasAccess = user && (
    isAdmin || 
    hasAllFacilities || 
    hasSpecificFacility || 
    (isManager && hasSpecificFacility)
  );
  
  // Special case handling for users created directly in Supabase
  const handleSupabaseUser = async () => {
    if (!user && window.location.pathname !== '/') {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          console.log('Detected Supabase user:', data.session.user);
          // Create a local user representation for the Supabase user
          const supabaseUser = {
            id: data.session.user.id,
            username: data.session.user.email || 'supabase-user',
            role: 'admin', // Default role for Supabase users
            facility: 'All', // Grant all facility access
          };
          
          localStorage.setItem('user', JSON.stringify(supabaseUser));
          window.location.reload(); // Reload to apply the new user data
          return true;
        }
      } catch (error) {
        console.error('Error checking Supabase session:', error);
      }
    }
    return false;
  };
  
  // If no local user is found, check for Supabase user
  if (!user) {
    // Attempt to handle Supabase user
    handleSupabaseUser();
    
    // Until that completes, redirect to login page
    return <Navigate to="/" replace />;
  }
  
  if (!hasAccess) {
    // User doesn't have access to this facility
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Access Restricted</h2>
        <p className="text-yellow-700">
          You don't have permission to access this facility. 
          Your assigned facility is: <strong>{user.facility}</strong>
        </p>
      </div>
    );
  }
  
  // User has access, render children
  return <>{children}</>;
};

export default FacilityAccessGuard;
