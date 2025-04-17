
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ToteScanner from './ToteScanner';
import { useToteSearch } from '@/hooks/useToteSearch';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

const ToteSearch = () => {
  const { searchTote, searchResult, isLoading, error } = useToteSearch();

  const handleSearch = async (toteId: string) => {
    await searchTote(toteId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tote Lifecycle Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ToteScanner
            onScan={handleSearch}
            placeholder="Search tote ID"
            buttonText="Search"
            isLoading={isLoading}
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {searchResult && (
            <div className="mt-4 space-y-4 border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Tote ID</h3>
                  <p>{searchResult.tote_id}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Current Status</h3>
                  <Badge>{searchResult.current_status || 'Unknown'}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold">Current Facility</h3>
                  <p>{searchResult.current_facility || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Source Facility</h3>
                  <p>{searchResult.source_facility || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Destination</h3>
                  <p>{searchResult.destination || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Grid Number</h3>
                  <p>{searchResult.grid_no || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Last Activity</h3>
                  <p>{searchResult.activity || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Inbound Time</h3>
                  <p>{formatDate(searchResult.ib_timestamp)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Staged Time</h3>
                  <p>{formatDate(searchResult.stagged_timestamp)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Outbound Time</h3>
                  <p>{formatDate(searchResult.ob_timestamp)}</p>
                </div>
                {searchResult.consignment_no && (
                  <div className="col-span-2">
                    <h3 className="font-semibold">Consignment Number</h3>
                    <p>{searchResult.consignment_no}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToteSearch;
