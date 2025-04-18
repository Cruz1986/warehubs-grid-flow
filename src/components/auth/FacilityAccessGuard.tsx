
import React from 'react';
import { Navigate } from 'react-router-dom';

interface FacilityAccessGuardProps {
  children: React.ReactNode;
  allowedFacility: string;
  requiresAdmin?: boolean; 
}

const FacilityAccessGuard: React.FC<FacilityAccessGuardProps> = ({ 
  children, 
  allowedFacility,
  requiresAdmin = false 
}) => {
  // Get current user from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // For debugging
  console.log('User info in FacilityAccessGuard:', user);
  console.log('Required facility:', allowedFacility);
  console.log('Requires admin only:', requiresAdmin);
  
  // Check if user has access to this facility
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isManager = user?.role?.toLowerCase() === 'manager';
  const hasAllFacilities = user?.facility === 'All';
  const hasSpecificFacility = user?.facility === allowedFacility;
  
  // For managers, check if they are accessing their own facility's data
  const isManagerAccessingOwnFacility = isManager && hasSpecificFacility;
  
  // Special case for grid-master path - allow managers to access
  const isGridMasterPath = window.location.pathname === '/grid-master';
  const isManagerAccessingGridMaster = isManager && isGridMasterPath;
  
  // If component requires admin access, check that first
  if (requiresAdmin && !isAdmin) {
    console.log('Access denied: Admin role required');
    return <Navigate to="/inbound" replace />;
  }
  
  // Check regular facility access
  // Allow manager access to their facility only
  const hasAccess = user && (
    isAdmin || 
    isManagerAccessingGridMaster ||
    (isManager && (hasAllFacilities || hasSpecificFacility || allowedFacility === 'All')) ||
    hasAllFacilities || 
    hasSpecificFacility
  );
  
  // Debug logging
  console.log('FacilityAccessGuard - Current path:', window.location.pathname);
  console.log('FacilityAccessGuard - User role:', user?.role);
  console.log('FacilityAccessGuard - User facility:', user?.facility);
  console.log('FacilityAccessGuard - Is Admin:', isAdmin);
  console.log('FacilityAccessGuard - Is Manager:', isManager);
  console.log('FacilityAccessGuard - Has Access:', hasAccess);
  console.log('FacilityAccessGuard - Is Manager Accessing Own Facility:', isManagerAccessingOwnFacility);
  console.log('FacilityAccessGuard - Is Manager Accessing Grid Master:', isManagerAccessingGridMaster);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (!hasAccess) {
    // User doesn't have access to this facility
    console.log('FacilityAccessGuard - Access denied, redirecting to dashboard');
    
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
