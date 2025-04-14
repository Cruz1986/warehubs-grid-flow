import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusCards from '../components/dashboard/StatusCards';
import ToteTable from '../components/operations/ToteTable';
import { Tote } from '../components/operations/ToteTable';
import { BarChart, Package, Grid2X2 } from 'lucide-react';

// Mock data for facility status - would be fetched from Google Sheets
const facilityData = {
  'Inbound': 248,
  'Staged': 185,
  'Outbound': 156,
  'Pending': 22,
};

// Correctly typed mock totes data
const inboundTotes: Tote[] = [
  {
    id: 'TOTE123456',
    status: 'inbound',
    source: 'Facility B',
    destination: 'Facility A',
    timestamp: '2023-04-14 09:30:15',
    user: 'user1',
    grid: undefined,
  },
  {
    id: 'TOTE789012',
    status: 'inbound',
    source: 'Facility C',
    destination: 'Facility A',
    timestamp: '2023-04-14 09:25:42',
    user: 'user2',
    grid: undefined,
  },
];

const stagedTotes: Tote[] = [
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
    id: 'TOTE654321',
    status: 'staged',
    source: 'Facility B',
    destination: 'Facility D',
    grid: 'G102',
    timestamp: '2023-04-14 09:10:05',
    user: 'user3',
  },
];

const outboundTotes: Tote[] = [
  {
    id: 'TOTE123458',
    status: 'outbound',
    source: 'Facility A',
    destination: 'Facility D',
    grid: 'G103',
    timestamp: '2023-04-14 08:45:10',
    user: 'user2',
  },
  {
    id: 'TOTE987654',
    status: 'outbound',
    source: 'Facility A',
    destination: 'Facility B',
    grid: 'G104',
    timestamp: '2023-04-14 08:30:45',
    user: 'user1',
  },
];

const Status = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Status Dashboard</h1>
      
      <StatusCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart className="mr-2 h-5 w-5" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(facilityData).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {key === 'Inbound' && <Package className="h-4 w-4 text-blue-600" />}
                      {key === 'Staged' && <Grid2X2 className="h-4 w-4 text-yellow-600" />}
                      {key === 'Outbound' && <Package className="h-4 w-4 text-green-600" />}
                      {key === 'Pending' && <Package className="h-4 w-4 text-red-600" />}
                      <span className="text-sm font-medium">{key}</span>
                    </div>
                    <span className="text-sm font-bold">{value} totes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        key === 'Inbound' ? 'bg-blue-600' : 
                        key === 'Staged' ? 'bg-yellow-600' : 
                        key === 'Outbound' ? 'bg-green-600' : 
                        'bg-red-600'
                      }`} 
                      style={{ width: `${Math.min(100, value / 3)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Grid2X2 className="mr-2 h-5 w-5" />
              Grid Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 25 }).map((_, index) => {
                // Mock grid occupancy - In a real app, this would show actual grid statuses
                const isOccupied = Math.random() > 0.4;
                const gridNumber = `G${(index + 1).toString().padStart(3, '0')}`;
                
                return (
                  <div 
                    key={index}
                    className={`aspect-square flex items-center justify-center rounded-md text-xs font-medium border ${
                      isOccupied 
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                    title={isOccupied ? `${gridNumber}: Occupied` : `${gridNumber}: Available`}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-sm mr-1"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded-sm mr-1"></div>
                <span>Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="inbound">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbound">Inbound</TabsTrigger>
            <TabsTrigger value="staged">Staged</TabsTrigger>
            <TabsTrigger value="outbound">Outbound</TabsTrigger>
          </TabsList>
          <TabsContent value="inbound">
            <ToteTable totes={inboundTotes} title="Recent Inbound Totes" />
          </TabsContent>
          <TabsContent value="staged">
            <ToteTable totes={stagedTotes} title="Currently Staged Totes" />
          </TabsContent>
          <TabsContent value="outbound">
            <ToteTable totes={outboundTotes} title="Recent Outbound Totes" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Status;
