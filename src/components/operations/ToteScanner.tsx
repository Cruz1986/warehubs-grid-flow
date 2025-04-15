
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Barcode, CheckCircle2, Loader2 } from 'lucide-react';

interface ToteScannerProps {
  onScan: (toteId: string) => void;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  isLoading?: boolean;
}

const ToteScanner = ({
  onScan,
  placeholder = "Scan or enter tote ID",
  buttonText = "Scan",
  autoFocus = true,
  inputRef,
  isLoading = false
}: ToteScannerProps) => {
  const [toteId, setToteId] = useState('');
  const [lastScannedTote, setLastScannedTote] = useState('');
  const defaultInputRef = useRef<HTMLInputElement>(null);
  
  // Use the provided inputRef or the default one
  const finalInputRef = inputRef || defaultInputRef;

  useEffect(() => {
    // Auto-focus the input when the component mounts
    if (autoFocus && finalInputRef.current) {
      finalInputRef.current.focus();
    }
  }, [autoFocus, finalInputRef]);

  const handleScan = () => {
    if (!toteId.trim()) {
      toast.error("Please enter a valid tote ID");
      return;
    }

    // Process the scan
    onScan(toteId);
    setLastScannedTote(toteId);
    setToteId('');
    
    // Refocus the input for the next scan
    if (finalInputRef.current) {
      finalInputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Barcode className="mr-2 h-5 w-5" />
          Tote Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            ref={finalInputRef}
            type="text"
            placeholder={placeholder}
            value={toteId}
            onChange={(e) => setToteId(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleScan} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>
        
        {lastScannedTote && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
            <div>
              <p className="text-sm font-medium">Last scanned:</p>
              <p className="text-lg font-bold">{lastScannedTote}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ToteScanner;
