
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, BarChartHorizontal, LineChart, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Placeholder data for charts
const weeklyData = [65, 59, 80, 81, 56, 55, 72];
const monthlyData = [28, 48, 40, 19, 86, 27, 90, 65, 59, 80, 81, 56, 55, 40];

const Status = () => {
  const { toast } = useToast();
  
  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export is being processed and will be ready shortly.",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Status Dashboard</h1>
      </div>
      
      <StatusCards />
      
      <div className="mt-6">
        <Tabs defaultValue="overview">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inbound">Inbound</TabsTrigger>
              <TabsTrigger value="outbound">Outbound</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
            </TabsList>
            
            <button 
              onClick={handleExportData}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              Export Data
            </button>
          </div>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Weekly Processing Trend</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end gap-2">
                    {weeklyData.map((value, i) => (
                      <div 
                        key={i} 
                        className="bg-blue-500 rounded-t w-full"
                        style={{ height: `${value}%` }}
                      >
                        <div className="h-full w-full hover:bg-blue-400 transition-colors"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Sun</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Processing Distribution</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[200px]">
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 rounded-full bg-blue-100">
                        <div 
                          className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-transparent"
                          style={{ 
                            borderTopColor: 'rgb(59, 130, 246)',
                            transform: 'rotate(45deg)'
                          }}
                        ></div>
                        <div 
                          className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-transparent"
                          style={{ 
                            borderRightColor: 'rgb(16, 185, 129)',
                            transform: 'rotate(45deg)'
                          }}
                        ></div>
                        <div 
                          className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-transparent"
                          style={{ 
                            borderBottomColor: 'rgb(168, 85, 247)',
                            transform: 'rotate(45deg)'
                          }}
                        ></div>
                        <div className="absolute inset-0 rounded-full bg-white flex items-center justify-center text-sm font-medium" style={{ margin: '25%' }}>
                          100%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mt-4 gap-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span>Inbound (40%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span>Outbound (35%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                      <span>Grid (25%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Monthly Performance</CardTitle>
                  <BarChartHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[150px] flex items-end gap-1">
                  {monthlyData.map((value, i) => (
                    <div 
                      key={i} 
                      className="bg-purple-500 rounded-t w-full"
                      style={{ height: `${value}%` }}
                    >
                      <div className="h-full w-full hover:bg-purple-400 transition-colors"></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-14 mt-2 text-[0.6rem] text-muted-foreground">
                  {monthlyData.map((_, i) => (
                    <div key={i} className="text-center">{i+1}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inbound" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inbound Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-700">Total Inbound</div>
                    <div className="text-2xl font-bold">245</div>
                    <div className="text-xs text-blue-500 mt-1">+12% from last week</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700">Processed</div>
                    <div className="text-2xl font-bold">187</div>
                    <div className="text-xs text-green-500 mt-1">76.3% completion rate</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-700">Pending</div>
                    <div className="text-2xl font-bold">58</div>
                    <div className="text-xs text-yellow-500 mt-1">23.7% remaining</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-700">Avg. Processing Time</div>
                    <div className="text-2xl font-bold">18.5m</div>
                    <div className="text-xs text-purple-500 mt-1">-2.3m from yesterday</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Processing Time Breakdown</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Receiving</span>
                        <span className="font-medium">5.2m</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Scanning</span>
                        <span className="font-medium">3.8m</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: '21%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Grid Assignment</span>
                        <span className="font-medium">4.6m</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Staging</span>
                        <span className="font-medium">4.9m</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: '26%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="outbound" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Outbound Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-700">Total Outbound</div>
                    <div className="text-2xl font-bold">198</div>
                    <div className="text-xs text-blue-500 mt-1">+8% from last week</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700">Shipped</div>
                    <div className="text-2xl font-bold">126</div>
                    <div className="text-xs text-green-500 mt-1">63.6% shipped rate</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-700">In Progress</div>
                    <div className="text-2xl font-bold">72</div>
                    <div className="text-xs text-yellow-500 mt-1">36.4% remaining</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-700">Avg. Shipping Time</div>
                    <div className="text-2xl font-bold">22.7m</div>
                    <div className="text-xs text-purple-500 mt-1">-1.5m from yesterday</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Destination Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium py-2">Destination</th>
                          <th className="text-right font-medium py-2">Totes</th>
                          <th className="text-right font-medium py-2">%</th>
                          <th className="text-right font-medium py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Facility A</td>
                          <td className="text-right">58</td>
                          <td className="text-right">29.3%</td>
                          <td className="text-right"><span className="text-green-600">●</span> On Track</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Facility B</td>
                          <td className="text-right">45</td>
                          <td className="text-right">22.7%</td>
                          <td className="text-right"><span className="text-yellow-600">●</span> Delayed</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Facility C</td>
                          <td className="text-right">37</td>
                          <td className="text-right">18.7%</td>
                          <td className="text-right"><span className="text-green-600">●</span> On Track</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Facility D</td>
                          <td className="text-right">32</td>
                          <td className="text-right">16.2%</td>
                          <td className="text-right"><span className="text-green-600">●</span> On Track</td>
                        </tr>
                        <tr>
                          <td className="py-2">Facility E</td>
                          <td className="text-right">26</td>
                          <td className="text-right">13.1%</td>
                          <td className="text-right"><span className="text-red-600">●</span> Critical</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grid Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-700">Total Grid Spaces</div>
                    <div className="text-2xl font-bold">90</div>
                    <div className="text-xs text-blue-500 mt-1">Full capacity</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700">Occupied</div>
                    <div className="text-2xl font-bold">68</div>
                    <div className="text-xs text-green-500 mt-1">75.6% utilization</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-700">Available</div>
                    <div className="text-2xl font-bold">22</div>
                    <div className="text-xs text-yellow-500 mt-1">24.4% free</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Grid Allocation by Destination</h3>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {Array.from({ length: 90 }).map((_, i) => {
                      const isOccupied = i < 68;
                      let bgColor = 'bg-gray-100';
                      if (isOccupied) {
                        if (i < 20) bgColor = 'bg-blue-500';
                        else if (i < 40) bgColor = 'bg-green-500';
                        else if (i < 55) bgColor = 'bg-purple-500';
                        else bgColor = 'bg-yellow-500';
                      }
                      return (
                        <div 
                          key={i} 
                          className={`${bgColor} aspect-square rounded-md`}
                        ></div>
                      );
                    })}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span>Facility A (20)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span>Facility B (20)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                      <span>Facility C (15)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span>Facility D (13)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-100 mr-1"></div>
                      <span>Available (22)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Status;
