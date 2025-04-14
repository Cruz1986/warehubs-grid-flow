
import React from 'react';
import { Activity, ArrowRight, CheckCircle, Clock, Grid3X3, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatusCard from './StatusCard';

// Placeholder data for demonstration
const statsData = {
  inbound: {
    total: 245,
    scanned: 187,
    staged: 154,
    pending: 58
  },
  outbound: {
    total: 198,
    scanned: 172,
    packed: 143,
    shipped: 126
  },
  grid: {
    total: 90,
    occupied: 68,
    available: 22,
    utilization: 75
  },
  fulfillment: {
    rate: 94.2,
    onTime: 97.3,
    accuracy: 99.1
  }
};

const StatusCards = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatusCard
        title="Inbound Processing"
        value={`${statsData.inbound.scanned}/${statsData.inbound.total}`}
        description="Totes processed"
        icon={<Package className="h-5 w-5 text-blue-500" />}
        footer={
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round((statsData.inbound.scanned / statsData.inbound.total) * 100)}%</span>
            </div>
            <Progress value={(statsData.inbound.scanned / statsData.inbound.total) * 100} className="h-1" />
          </div>
        }
      />

      <StatusCard
        title="Outbound Processing"
        value={`${statsData.outbound.shipped}/${statsData.outbound.total}`}
        description="Totes shipped"
        icon={<ArrowRight className="h-5 w-5 text-green-500" />}
        footer={
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round((statsData.outbound.shipped / statsData.outbound.total) * 100)}%</span>
            </div>
            <Progress value={(statsData.outbound.shipped / statsData.outbound.total) * 100} className="h-1" />
          </div>
        }
      />

      <StatusCard
        title="Grid Utilization"
        value={`${statsData.grid.occupied}/${statsData.grid.total}`}
        description="Grid spaces filled"
        icon={<Grid3X3 className="h-5 w-5 text-purple-500" />}
        footer={
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Utilization</span>
              <span>{statsData.grid.utilization}%</span>
            </div>
            <Progress value={statsData.grid.utilization} className="h-1" />
          </div>
        }
      />

      <StatusCard
        title="Fulfillment Rate"
        value={`${statsData.fulfillment.rate}%`}
        description="Overall fulfillment"
        icon={<CheckCircle className="h-5 w-5 text-green-500" />}
        footer={
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">On-time: </span>
              <span className="ml-auto font-medium">{statsData.fulfillment.onTime.toString()}%</span>
            </div>
            <div className="flex items-center">
              <Activity className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Accuracy: </span>
              <span className="ml-auto font-medium">{statsData.fulfillment.accuracy.toString()}%</span>
            </div>
          </div>
        }
      />
      
      {/* Detailed status cards */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Inbound Status</CardTitle>
          <CardDescription>Current inbound processing metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Totes Received</div>
              <div className="text-2xl font-bold">{statsData.inbound.total}</div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span className="rounded-md bg-blue-100 px-1 text-blue-800">Today</span>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Scanned</span>
                  <span className="font-medium">{statsData.inbound.scanned.toString()}</span>
                </div>
                <Progress value={(statsData.inbound.scanned / statsData.inbound.total) * 100} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Staged to Grid</span>
                  <span className="font-medium">{statsData.inbound.staged.toString()}</span>
                </div>
                <Progress value={(statsData.inbound.staged / statsData.inbound.total) * 100} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Pending</span>
                  <span className="font-medium">{statsData.inbound.pending.toString()}</span>
                </div>
                <Progress value={(statsData.inbound.pending / statsData.inbound.total) * 100} className="h-1" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="text-xs text-muted-foreground">Updated 5 minutes ago</div>
        </CardFooter>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Outbound Status</CardTitle>
          <CardDescription>Current outbound processing metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">Totes to Ship</div>
              <div className="text-2xl font-bold">{statsData.outbound.total}</div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span className="rounded-md bg-green-100 px-1 text-green-800">Today</span>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Scanned</span>
                  <span className="font-medium">{statsData.outbound.scanned.toString()}</span>
                </div>
                <Progress value={(statsData.outbound.scanned / statsData.outbound.total) * 100} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Packed</span>
                  <span className="font-medium">{statsData.outbound.packed.toString()}</span>
                </div>
                <Progress value={(statsData.outbound.packed / statsData.outbound.total) * 100} className="h-1" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Shipped</span>
                  <span className="font-medium">{statsData.outbound.shipped.toString()}</span>
                </div>
                <Progress value={(statsData.outbound.shipped / statsData.outbound.total) * 100} className="h-1" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="text-xs text-muted-foreground">Updated 5 minutes ago</div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StatusCards;
