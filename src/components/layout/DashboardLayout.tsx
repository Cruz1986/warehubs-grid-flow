
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    // Redirect if no user is logged in
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Redirect if admin access is required but user is not an admin
    if (requireAdmin && !isAdmin) {
      navigate('/inbound');
    }
  }, [currentUser, navigate, requireAdmin, isAdmin]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header>
          <MobileSidebar />
        </Header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
