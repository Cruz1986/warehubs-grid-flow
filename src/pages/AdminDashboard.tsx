
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import SystemStatusCard from '../components/dashboard/SystemStatusCard';
import { useDashboardData } from '@/hooks/useDashboardData';

const AdminDashboard = () => {
  const { recentActivities, systemStatuses, isLoading } = useDashboardData();

  return (
    <DashboardLayout requireAdmin={true}>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <StatusCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <RecentActivityCard 
          activities={recentActivities}
          isLoading={isLoading}
        />
        
        <SystemStatusCard 
          systemStatuses={systemStatuses}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
