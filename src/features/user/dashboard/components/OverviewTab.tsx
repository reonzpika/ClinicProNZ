'use client';

import { 
  Users, 
  Calendar, 
  Activity, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Shield 
} from 'lucide-react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Card, CardContent } from '@/src/shared/components/ui/card';

import { mockOverviewMetrics } from '../data/mockData';
import { MetricCard } from './MetricCard';

export function OverviewTab() {
  const metrics = mockOverviewMetrics;

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Total Sessions */}
        <MetricCard
          title="Total Sessions (All-time)"
          value={metrics.totalSessions.toLocaleString()}
          icon={Users}
          trend={{
            value: metrics.totalSessionsTrend,
            direction: 'up',
            color: 'green'
          }}
        />

        {/* Sessions Today */}
        <MetricCard
          title="Sessions Today"
          value={metrics.sessionsToday}
          icon={Calendar}
          trend={{
            value: metrics.sessionsTodayTrend,
            direction: 'up',
            color: 'green'
          }}
        />

        {/* Active Sessions */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(metrics.activeSessions).reduce((a, b) => a + b, 0)}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Generated: {metrics.activeSessions.generated}
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Edited: {metrics.activeSessions.edited}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Completed: {metrics.activeSessions.completed}
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Failed: {metrics.activeSessions.failed}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Consultation Time */}
        <MetricCard
          title="Average Consultation Time"
          value={`${metrics.averageConsultationTime} mins`}
          icon={Clock}
          trend={{
            value: `${metrics.consultationTimeTrend} min`,
            direction: 'down',
            color: 'green'
          }}
        />

        {/* Time Saved Today */}
        <MetricCard
          title="Estimated Time Saved Today"
          value={`${metrics.timeSavedToday} hrs`}
          icon={TrendingUp}
          trend={{
            value: `${metrics.timeSavedTrend} hrs`,
            direction: 'up',
            color: 'green'
          }}
          className="bg-green-50 border-green-200"
        />

        {/* Admin Time Saved */}
        <MetricCard
          title="Admin Time Saved"
          value={`$${metrics.adminTimeSaved} NZD`}
          subtitle="Value of after-hours admin work saved"
          icon={DollarSign}
          trend={{
            value: metrics.adminTimeSavedTrend,
            direction: 'down',
            color: 'red'
          }}
          className="bg-green-50 border-green-200"
        />

        {/* Consent Compliance */}
        <MetricCard
          title="Consent Compliance" 
          value={`${metrics.consentCompliance}%`}
          subtitle="Sessions with valid consent"
          icon={Shield}
          className="bg-green-50 border-green-200"
        />
      </div>
    </div>
  );
}