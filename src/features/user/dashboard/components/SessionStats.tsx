'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

type Stats = { lifetime: number; active: number };

export default function SessionStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/patient-sessions/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Trackers</CardTitle>
        <CardDescription>Total sessions (lifetime) and currently active</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-6 text-gray-600">Loading...</div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600">Lifetime Sessions</div>
              <div className="text-3xl font-semibold">{stats.lifetime}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Active Sessions</div>
              <div className="text-3xl font-semibold">{stats.active}</div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-gray-600">No data</div>
        )}
      </CardContent>
    </Card>
  );
}

