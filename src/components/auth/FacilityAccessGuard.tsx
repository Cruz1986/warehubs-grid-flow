
import React from 'react';
import { Navigate } from 'react-router-dom';

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
  // Fix: Make role check case-insensitive and properly check admin access
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const hasAllFacilities = user?.facility === 'All';
  const hasSpecificFacility = user?.facility === allowedFacility;
  
  const hasAccess = user && (isAdmin || hasAllFacilities || hasSpecificFacility);
  
  if (!user) {
    // User is not logged in, redirect to login page
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
