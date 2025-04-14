
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Grid, Package } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatusCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue
}: StatusCardProps) => {
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
        {(description || trend) && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend && (
              <span className={`mr-1 flex items-center ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {trend === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                {trend === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                {trendValue}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;
