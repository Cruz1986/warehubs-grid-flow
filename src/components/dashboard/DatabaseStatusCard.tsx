
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TableStatus {
  name: string;
  connected: boolean;
  count: number | null;
  error?: string;
}

// Define the valid table names as a type
type TableName = 'facilities' | 'grid_mappings' | 'grids' | 'totes' | 'users';

const DatabaseStatusCard = () => {
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>('');

  const checkTables = async () => {
    setIsLoading(true);
    // Define the tables array with the correct type
    const tables: TableName[] = ['facilities', 'grid_mappings', 'grids', 'totes', 'users'];
    const statuses: TableStatus[] = [];

    for (const table of tables) {
      try {
        console.log(`Checking table: ${table}`);
        // Now TypeScript knows 'table' is one of the valid table names
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error(`Error checking table ${table}:`, error);
          statuses.push({ 
            name: table, 
            connected: false, 
            count: null,
            error: error.message 
          });
          toast.error(`Failed to connect to table: ${table}`, {
            description: error.message
          });
        } else {
          console.log(`Table ${table} is accessible. Count: ${count}`);
          statuses.push({ name: table, connected: true, count });
        }
      } catch (err) {
        console.error(`Exception checking table ${table}:`, err);
        statuses.push({ 
          name: table, 
          connected: false, 
          count: null,
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    setTableStatuses(statuses);
    setLastCheck(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  useEffect(() => {
    checkTables();
    
    // Re-check every 30 seconds
    const interval = setInterval(checkTables, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <DatabaseIcon className="mr-2 h-5 w-5" />
          Database Tables Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Checking database tables...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tableStatuses.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      {table.connected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{table.name}</span>
                    </div>
                    <div className="flex items-center">
                      {table.connected ? (
                        <Badge variant="outline" className="bg-green-50">
                          {table.count !== null ? `${table.count} rows` : 'Connected'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          Disconnected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                Last checked: {lastCheck}
                {tableStatuses.some(t => !t.connected) && (
                  <div className="mt-1 text-red-500">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Some tables are not accessible. Check console for error details.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseStatusCard;
