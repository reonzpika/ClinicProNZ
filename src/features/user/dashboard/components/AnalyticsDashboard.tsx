'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/shared/components/ui/tabs';

import { OverviewTab } from './OverviewTab';
import { SessionLogTab } from './SessionLogTab';

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated] = useState(new Date());

  const handleRefresh = () => {
    // TODO: Implement data refresh functionality
    console.log('Refreshing dashboard data...');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                GP Analytics & Audit Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleString('en-NZ')}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="session-log"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
            >
              Session Log
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="session-log" className="space-y-6">
            <SessionLogTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}