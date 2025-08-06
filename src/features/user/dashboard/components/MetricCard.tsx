'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/src/shared/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    color: 'green' | 'red' | 'gray';
  };
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon,
  className = ''
}: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.color) {
      case 'green': return 'text-green-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown;

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="h-5 w-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>

            {trend && (
              <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{trend.value}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}