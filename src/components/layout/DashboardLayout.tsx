
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const DashboardLayout = ({ children, requireAdmin = false }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/');
      return;
    }
    
    // Check if admin access is required
    if (requireAdmin) {
      const user = JSON.parse(userString);
      if (!user.isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [navigate, requireAdmin]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
