
import React from 'react';
import { Building } from 'lucide-react';

interface CurrentFacilityDisplayProps {
  facilityName: string;
}

const CurrentFacilityDisplay: React.FC<CurrentFacilityDisplayProps> = ({ facilityName }) => {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center mb-4">
      <Building className="text-blue-500 mr-2 h-5 w-5" />
      <div>
        <p className="text-sm text-blue-700 font-medium">Current Facility</p>
        <p className="text-base font-semibold">{facilityName}</p>
      </div>
    </div>
  );
};

export default CurrentFacilityDisplay;
