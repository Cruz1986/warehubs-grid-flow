
import React, { useRef, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ToteScanner from '../components/operations/ToteScanner';
import ToteTable from '../components/operations/ToteTable';
import GridScanner from '../components/operations/GridScanner';
import { useGridManagement } from '@/hooks/useGridManagement';

const GridManagement = () => {
  const {
    scannedTote,
    gridId,
    stagedTotes,
    validGrids,
    isLoading,
    gridError,
    handleToteScan,
    handleGridChange,
    handleGridScan
  } = useGridManagement();
  
  const toteInputRef = useRef<HTMLInputElement>(null);
  
  // Focus on tote input initially
  useEffect(() => {
    if (toteInputRef.current) {
      toteInputRef.current.focus();
    }
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Grid Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ToteScanner
          onScan={handleToteScan}
          placeholder="Scan tote to place in grid"
          inputRef={toteInputRef}
        />
        
        <GridScanner
          scannedTote={scannedTote}
          gridId={gridId}
          validGrids={validGrids}
          isLoading={isLoading}
          gridError={gridError}
          onGridChange={handleGridChange}
          onGridScan={handleGridScan}
        />
      </div>
      
      <ToteTable
        totes={stagedTotes}
        title="Recently Staged Totes"
      />
    </DashboardLayout>
  );
};

export default GridManagement;
