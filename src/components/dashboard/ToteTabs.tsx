
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToteTable, { Tote } from '../operations/ToteTable';

interface ToteTabsProps {
  inboundTotes: Tote[];
  stagedTotes: Tote[];
  outboundTotes: Tote[];
  isLoading: boolean;
}

const ToteTabs: React.FC<ToteTabsProps> = ({ 
  inboundTotes, 
  stagedTotes, 
  outboundTotes, 
  isLoading 
}) => {
  return (
    <Tabs defaultValue="inbound">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="inbound">Inbound</TabsTrigger>
        <TabsTrigger value="staged">Staged</TabsTrigger>
        <TabsTrigger value="outbound">Outbound</TabsTrigger>
      </TabsList>
      <TabsContent value="inbound">
        <ToteTable totes={inboundTotes} title="Recent Inbound Totes" isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="staged">
        <ToteTable totes={stagedTotes} title="Currently Staged Totes" isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="outbound">
        <ToteTable totes={outboundTotes} title="Recent Outbound Totes" isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
};

export default ToteTabs;
