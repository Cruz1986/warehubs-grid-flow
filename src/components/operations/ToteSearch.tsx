import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ToteScanner from './ToteScanner';
import { useToteSearch } from '@/hooks/useToteSearch';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { History, ArrowDownWideNarrow, AlertTriangle, CheckCircle } from 'lucide-react';

const ToteSearch = () => {
  const { searchTote, searchResult, toteHistory, isLoading, error, notFound } = useToteSearch();
  const [lastScannedTote, setLastScannedTote] = useState<string | null>(null);

  const handleSearch = async (toteId: string) => {
    setLastScannedTote(toteId);
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

          {lastScannedTote && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Last scanned: {lastScannedTote}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {notFound && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Tote not found in database
              </AlertDescription>
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
                  <p>{formatDate(searchResult.staged_timestamp)}</p>
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

          {toteHistory.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Tote History</h3>
                <ArrowDownWideNarrow className="h-4 w-4 text-muted-foreground ml-1" />
              </div>
              <div className="space-y-3">
                {toteHistory.map((event, index) => (
                  <div 
                    key={`${event.activity}-${event.timestamp}-${index}`}
                    className="flex items-start gap-4 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.activity}</span>
                        <Badge variant="outline">{event.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>Facility: {event.facility}</span>
                        {event.operator && (
                          <span className="ml-3">Operator: {event.operator}</span>
                        )}
                      </div>
                    </div>
                    <time className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(event.timestamp)}
                    </time>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToteSearch;
