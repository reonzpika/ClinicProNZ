'use client';

import { Activity, Clock, Database, RefreshCw, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

import { templatePerformance } from '../utils/compileTemplate';

type PerformanceStats = {
  templateCacheSize: number;
  systemPromptCached: boolean;
  cacheHitRate: string;
  compilationTimes: number[];
  averageCompilationTime: number;
  totalCompilations: number;
};

export function TemplatePerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    templateCacheSize: 0,
    systemPromptCached: false,
    cacheHitRate: 'No data',
    compilationTimes: [],
    averageCompilationTime: 0,
    totalCompilations: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  const updateStats = () => {
    const cacheStats = templatePerformance.getCacheStats();
    setStats(prev => ({
      ...prev,
      templateCacheSize: cacheStats.templateCacheSize,
      systemPromptCached: cacheStats.systemPromptCached,
      cacheHitRate: cacheStats.cacheHitRate,
    }));
  };

  const clearCache = () => {
    templatePerformance.clearCache();
    updateStats();
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Don't show in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="mr-1 size-4" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-2 border-blue-200 bg-white/95 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="size-4" />
              Template Performance
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={updateStats}
                className="size-6 p-0"
              >
                <RefreshCw className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="size-6 p-0"
              >
                Ã—
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Cache Statistics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Database className="size-3" />
                <span>Template Cache</span>
              </div>
              <Badge variant={stats.templateCacheSize > 0 ? 'default' : 'secondary'}>
                {stats.templateCacheSize}
                {' '}
                entries
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Zap className="size-3" />
                <span>System Prompt</span>
              </div>
              <Badge variant={stats.systemPromptCached ? 'default' : 'secondary'}>
                {stats.systemPromptCached ? 'Cached' : 'Not cached'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TrendingUp className="size-3" />
                <span>Cache Hit Rate</span>
              </div>
              <Badge variant="outline">
                {stats.cacheHitRate}
              </Badge>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2 border-t pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                <span>Avg. Compilation</span>
              </div>
              <Badge variant="outline">
                {stats.averageCompilationTime > 0
                  ? `${stats.averageCompilationTime.toFixed(1)}ms`
                  : 'N/A'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Total Compilations</span>
              <Badge variant="outline">
                {stats.totalCompilations}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              className="h-6 flex-1 text-xs"
            >
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={updateStats}
              className="h-6 flex-1 text-xs"
            >
              Refresh
            </Button>
          </div>

          {/* Cache Efficiency Indicator */}
          <div className="text-center">
            {stats.templateCacheSize > 10 && (
              <div className="flex items-center justify-center gap-1 text-green-600">
                <Zap className="size-3" />
                <span>Cache optimised</span>
              </div>
            )}
            {stats.templateCacheSize === 0 && (
              <div className="flex items-center justify-center gap-1 text-amber-600">
                <Clock className="size-3" />
                <span>Cache warming up</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
