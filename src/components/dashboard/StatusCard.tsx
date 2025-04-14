
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export interface StatusCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  footer?: React.ReactNode; // Making footer an optional prop
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  footer
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      {footer && (
        <CardFooter className="border-t pt-2">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default StatusCard;
