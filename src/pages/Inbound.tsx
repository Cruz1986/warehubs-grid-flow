
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InboundProcessingForm from '@/components/operations/InboundProcessingForm';
import ConsignmentReceiver from '@/components/operations/consignment/ConsignmentReceiver';
import ToteSearch from '@/components/operations/ToteSearch';

const Inbound = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Inbound Operations</h1>
      
      <Tabs defaultValue="inbound" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbound">Inbound Processing</TabsTrigger>
          <TabsTrigger value="consignments">Consignments</TabsTrigger>
          <TabsTrigger value="search">Tote Search</TabsTrigger>
        </TabsList>

        <TabsContent value="inbound">
          <InboundProcessingForm />
        </TabsContent>

        <TabsContent value="consignments">
          <ConsignmentReceiver currentFacility="Yelahanka" />
        </TabsContent>

        <TabsContent value="search">
          <ToteSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inbound;
