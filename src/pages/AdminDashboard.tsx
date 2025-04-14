
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, PackageOpen, PackageCheck, Grid2X2 } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <DashboardLayout requireAdmin={true}>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <StatusCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PackageOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">120 totes received from Facility B</span>
                </div>
                <span className="text-xs text-gray-500">30m ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Grid2X2 className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">85 totes staged to grids</span>
                </div>
                <span className="text-xs text-gray-500">1h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PackageCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">72 totes shipped to Facility C</span>
                </div>
                <span className="text-xs text-gray-500">2h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Daily inventory report generated</span>
                </div>
                <span className="text-xs text-gray-500">4h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">System Status</CardTitle>
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Sync Status</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Response Time</span>
                  <span className="text-xs">120ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <span className="text-xs">8 online</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Load</span>
                  <span className="text-xs">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
