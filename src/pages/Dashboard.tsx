import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import ToteTable from '../components/operations/ToteTable';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, PackageOpen, PackageCheck, Grid2X2 } from 'lucide-react';
import { Tote } from '../components/operations/ToteTable';  // Import Tote type

// Correctly typed mock totes data
const recentTotes: Tote[] = [
  {
    id: 'TOTE123456',
    status: 'inbound',
    source: 'Facility B',
    destination: 'Facility A',
    timestamp: '2023-04-14 09:30:15',
    user: 'user1',
    grid: undefined,  // Add missing optional grid property
  },
  {
    id: 'TOTE123457',
    status: 'staged',
    source: 'Facility C',
    destination: 'Facility D',
    grid: 'G101',
    timestamp: '2023-04-14 09:15:22',
    user: 'user1',
  },
  {
    id: 'TOTE123458',
    status: 'outbound',
    source: 'Facility A',
    destination: 'Facility D',
    grid: 'G103',
    timestamp: '2023-04-14 08:45:10',
    user: 'user2',
  },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <StatusCards />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Link to="/inbound">
          <Button variant="outline" className="h-24 w-full">
            <div className="flex flex-col items-center justify-center space-y-2">
              <PackageOpen className="h-6 w-6 text-blue-600" />
              <span>Inbound Processing</span>
            </div>
            <ArrowRight className="h-5 w-5 ml-auto" />
          </Button>
        </Link>
        
        <Link to="/grid-management">
          <Button variant="outline" className="h-24 w-full">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Grid2X2 className="h-6 w-6 text-yellow-600" />
              <span>Grid Management</span>
            </div>
            <ArrowRight className="h-5 w-5 ml-auto" />
          </Button>
        </Link>
        
        <Link to="/outbound">
          <Button variant="outline" className="h-24 w-full">
            <div className="flex flex-col items-center justify-center space-y-2">
              <PackageCheck className="h-6 w-6 text-green-600" />
              <span>Outbound Processing</span>
            </div>
            <ArrowRight className="h-5 w-5 ml-auto" />
          </Button>
        </Link>
      </div>
      
      <div className="mt-6">
        <ToteTable totes={recentTotes} title="Recent Tote Activity" />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
