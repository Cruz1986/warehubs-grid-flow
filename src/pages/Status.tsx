import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatusCards from '../components/dashboard/StatusCards';
import ActivityCard from '../components/dashboard/ActivityCard';
import GridCapacityVisual from '../components/dashboard/GridCapacityVisual';
import ToteTabs from '../components/dashboard/ToteTabs';
import SystemStatusIndicator from '../components/dashboard/SystemStatusIndicator';
import { useStatusData } from '@/hooks/useStatusData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Status = () => {
  const {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    facilityData,
    gridStatuses,
    isLoadingTotes,
    isLoadingActivity,
    isLoadingGrids,
    error
  } = useStatusData();

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dataType, setDataType] = useState<string>("all");

  console.log('Status dashboard data:', {
    inboundCount: inboundTotes.length,
    stagedCount: stagedTotes.length,
    outboundCount: outboundTotes.length,
    isLoading: isLoadingTotes,
    error
  });

  const handleExportData = () => {
    // Determine which data to export based on selection
    let dataToExport: any[] = [];
    let fileName = 'warehouse-data';
    
    // Fix: ensure we have data before attempting to export
    if (inboundTotes && outboundTotes && stagedTotes && gridStatuses) {
      if (dataType === 'all' || dataType === 'inbound') {
        dataToExport = [...dataToExport, ...inboundTotes.map(tote => ({...tote, type: 'inbound'}))];
        fileName = dataType === 'inbound' ? 'inbound-totes' : fileName;
      }
      
      if (dataType === 'all' || dataType === 'staged') {
        dataToExport = [...dataToExport, ...stagedTotes.map(tote => ({...tote, type: 'staged'}))];
        fileName = dataType === 'staged' ? 'staged-totes' : fileName;
      }
      
      if (dataType === 'all' || dataType === 'outbound') {
        dataToExport = [...dataToExport, ...outboundTotes.map(tote => ({...tote, type: 'outbound'}))];
        fileName = dataType === 'outbound' ? 'outbound-totes' : fileName;
      }
      
      if (dataType === 'grid') {
        dataToExport = gridStatuses || [];
        fileName = 'grid-statuses';
      }
    }
    
    // Apply date filtering if dates are selected
    if (startDate || endDate) {
      dataToExport = dataToExport.filter(item => {
        if (!item) return false;
        
        // Different data types might have different date fields
        let itemDate;
        try {
          // Try to find a valid date field
          const dateStr = item.created_at || item.timestamp || item.timestamp_in || 
                          item.timestamp_out || item.grid_timestamp || item.date;
                          
          if (dateStr) {
            itemDate = new Date(dateStr);
          } else {
            return true; // If no date field, include the item
          }
          
          // Check if date parsing worked
          if (isNaN(itemDate.getTime())) {
            return true; // Keep items with invalid dates
          }
        } catch (e) {
          console.error('Error parsing date for item:', item, e);
          return true; // Keep items with date parsing errors
        }
        
        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          return itemDate >= startDate;
        } else if (endDate) {
          return itemDate <= endDate;
        }
        
        return true;
      });
    }
    
    // Convert to CSV and trigger download
    if (dataToExport.length > 0) {
      try {
        // Get headers from the first object
        const headers = Object.keys(dataToExport[0]);
        
        // Create CSV content
        const csvContent = [
          headers.join(','), // Header row
          ...dataToExport.map(row => 
            headers.map(header => {
              // Handle values that might need escaping in CSV
              let value = row[header];
              if (value === null || value === undefined) return '';
              if (typeof value === 'object') value = JSON.stringify(value);
              value = String(value);
              // Escape quotes and wrap in quotes if contains comma
              if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }).join(',')
          )
        ].join('\n');
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Export successful', {
          description: `Downloaded ${dataToExport.length} records`
        });
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Export failed', {
          description: 'There was an error generating the export file'
        });
      }
    } else {
      toast.warning('No data to export', {
        description: 'Try adjusting your filters or selecting a different data type'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">Status Dashboard</h1>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label className="text-sm font-medium">Data Type</label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data</SelectItem>
                    <SelectItem value="inbound">Inbound Totes</SelectItem>
                    <SelectItem value="staged">Staged Totes</SelectItem>
                    <SelectItem value="outbound">Outbound Totes</SelectItem>
                    <SelectItem value="grid">Grid Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <StatusCards />
          </div>
          <div className="md:col-span-1">
            <SystemStatusIndicator />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActivityCard 
            facilityData={facilityData} 
            isLoading={isLoadingActivity} 
          />
          
          <GridCapacityVisual 
            gridStatuses={gridStatuses} 
            isLoading={isLoadingGrids} 
          />
        </div>
        
        <div>
          <ToteTabs 
            inboundTotes={inboundTotes}
            stagedTotes={stagedTotes}
            outboundTotes={outboundTotes}
            isLoading={isLoadingTotes}
            error={error}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Status;
