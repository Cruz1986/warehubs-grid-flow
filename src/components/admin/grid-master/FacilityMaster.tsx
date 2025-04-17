
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from 'lucide-react';
import { Facility, FacilityType } from '../GridMasterComponent';
import AddFacilityDialog from './AddFacilityDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FacilityMasterProps {
  facilities: Facility[];
  onFacilityAdded: (facility: Facility) => void;
  onFacilityDeleted: (facilityId: string) => void;
  isLoading: boolean;
}

const FacilityMaster: React.FC<FacilityMasterProps> = ({
  facilities,
  onFacilityAdded,
  onFacilityDeleted,
  isLoading
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Get user role from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const handleDeleteFacility = async (facility: Facility) => {
    if (window.confirm(`Are you sure you want to delete ${facility.name}?`)) {
      try {
        const { error } = await supabase
          .from('facility_master')
          .delete()
          .eq('id', facility.id);
        
        if (error) throw error;
        onFacilityDeleted(facility.id);
      } catch (error) {
        console.error('Error deleting facility:', error);
        toast.error('Failed to delete facility');
      }
    }
  };

  const facilityTypeColorMap: Record<FacilityType, string> = {
    'Fulfilment_Center': 'bg-blue-100 text-blue-800',
    'Sourcing_Hub': 'bg-green-100 text-green-800',
    'Dark_Store': 'bg-purple-100 text-purple-800'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Facility Master</CardTitle>
          <CardDescription>
            Manage facilities: Fulfillment Centers, Sourcing Hubs, and Darkstores
          </CardDescription>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">Loading facilities...</div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No facilities configured yet. {isAdmin ? 'Use the Add Facility button to create one.' : 'Please contact an administrator to add facilities.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                {isAdmin && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell className="font-medium">{facility.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${facilityTypeColorMap[facility.type]}`}>
                      {facility.type}
                    </span>
                  </TableCell>
                  <TableCell>{facility.location || '-'}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteFacility(facility)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {isAdmin && (
        <AddFacilityDialog 
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onFacilityAdded={onFacilityAdded}
        />
      )}
    </Card>
  );
};

export default FacilityMaster;
