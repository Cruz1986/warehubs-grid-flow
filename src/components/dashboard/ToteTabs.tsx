
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToteTable, { Tote } from '../operations/ToteTable';
import { Badge } from '@/components/ui/badge';

interface ToteTabsProps {
  inboundTotes: Tote[];
  stagedTotes: Tote[];
  outboundTotes: Tote[];
  isLoading: boolean;
  error?: string | null;
}

const ToteTabs: React.FC<ToteTabsProps> = ({ 
  inboundTotes, 
  stagedTotes, 
  outboundTotes, 
  isLoading,
  error
}) => {
  return (
    <Tabs defaultValue="inbound">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="inbound">
          Inbound
          {inboundTotes.length > 0 && (
            <Badge variant="outline" className="ml-2">{inboundTotes.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="staged">
          Staged
          {stagedTotes.length > 0 && (
            <Badge variant="outline" className="ml-2">{stagedTotes.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="outbound">
          Outbound
          {outboundTotes.length > 0 && (
            <Badge variant="outline" className="ml-2">{outboundTotes.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="inbound">
        <ToteTable 
          totes={inboundTotes} 
          title="Recent Inbound Totes" 
          isLoading={isLoading} 
          error={error}
          hideGrid={true}
        />
      </TabsContent>
      <TabsContent value="staged">
        <ToteTable 
          totes={stagedTotes} 
          title="Currently Staged Totes" 
          isLoading={isLoading} 
          error={error}
        />
      </TabsContent>
      <TabsContent value="outbound">
        <ToteTable 
          totes={outboundTotes} 
          title="Recent Outbound Totes" 
          isLoading={isLoading} 
          error={error}
          hideGrid={true}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ToteTabs;
