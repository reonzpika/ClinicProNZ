'use client';

import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

type User = {
  id: string;
  email: string | null;
};

type SessionsByStatus = {
  status: 'active' | 'completed' | 'archived';
  count: number;
};

type TemplatesByType = {
  type: 'default' | 'custom';
  count: number;
};

type UserCount = {
  userId: string | null;
  count: number;
};

type OwnerCount = {
  ownerId: string | null;
  count: number;
};

type Activity = {
  id: string;
  type: 'session' | 'template';
  createdAt: string;
  userId: string | null;
  details: {
    patientName?: string;
    status?: string;
    name?: string;
    type?: string;
  };
};

type Pagination = {
  page: number;
  limit: number;
  hasMore: boolean;
};

type AnalyticsData = {
  users: {
    total: number;
  };
  sessions: {
    total: number;
    byStatus: SessionsByStatus[];
    byUser: UserCount[];
    previousPeriod?: number;
  };
  templates: {
    total: number;
    byType: TemplatesByType[];
    byUser: OwnerCount[];
    previousPeriod?: number;
  };
  recentActivities: Activity[];
  allUsers: User[];
  dateRange: string;
  filterUserId: string | null;
  pagination: Pagination;
};

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'total'>('total');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAnalytics = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('dateRange', dateRange);
      params.set('page', page.toString());
      params.set('limit', '50');
      if (filterUserId) {
        params.set('userId', filterUserId);
      }

      const response = await fetch(`/api/admin/analytics?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const analyticsData = await response.json();
      setData(analyticsData);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateRange, filterUserId]);

  useEffect(() => {
    setCurrentPage(1);
    fetchAnalytics(1);
  }, [dateRange, filterUserId, fetchAnalytics]);

  const getActivityIcon = (type: string) => {
    return type === 'session' ? '🏥' : '📄';
  };

  const getActivityColor = (type: string) => {
    return type === 'session' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const formatActivityDetails = (activity: Activity) => {
    if (activity.type === 'session') {
      const patientName = activity.details.patientName || 'Unknown Patient';
      const status = activity.details.status || 'unknown';
      return `Session for ${patientName} • ${status}`;
    } else {
      const name = activity.details.name || 'Unknown Template';
      const type = activity.details.type || 'unknown';
      return `${name} • ${type} template`;
    }
  };

  const calculatePercentageChange = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) {
 return null;
}
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const getUserDisplayName = (userId: string | null) => {
    if (!userId || !data) {
 return 'Unknown User';
}
    const user = data.allUsers.find(u => u.id === userId);
    if (!user) {
 return userId;
}

    return user.email || userId;
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '7': return 'Last 7 Days';
      case '30': return 'Last 30 Days';
      case '90': return 'Last 90 Days';
      case 'total': return 'All Time';
      default: return range;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-24 rounded-lg bg-gray-200" />
            ))}
          </div>
          <div className="h-64 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
Error:
{error}
          </p>
          <Button onClick={() => fetchAnalytics(1)} className="mt-2" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
 return null;
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <Button onClick={() => fetchAnalytics(currentPage)} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="date-range-filter" className="text-sm font-medium text-gray-700">
            Date Range:
          </label>
          <select
            id="date-range-filter"
            value={dateRange}
            onChange={e => setDateRange(e.target.value as typeof dateRange)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="total">All Time</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="user-filter" className="text-sm font-medium text-gray-700">
            Filter by User:
          </label>
                     <select
                       id="user-filter"
                       value={filterUserId}
                       onChange={e => setFilterUserId(e.target.value)}
                       className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                     >
             <option value="">All Users</option>
             {data.allUsers.map(user => (
               <option key={user.id} value={user.id}>
                 {getUserDisplayName(user.id)}
               </option>
             ))}
                     </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing data for:
{' '}
{getDateRangeLabel(dateRange)}
          {filterUserId && ` • User: ${getUserDisplayName(filterUserId)}`}
        </div>
      </div>

             {/* Main Stats Cards */}
       <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
         <Card>
           <CardContent className="p-4 text-center">
             <div className="text-2xl font-bold text-indigo-600">{data.users.total}</div>
             <div className="text-sm text-gray-600">Total Users</div>
           </CardContent>
         </Card>

         <Card>
           <CardContent className="p-4 text-center">
             <div className="text-2xl font-bold text-blue-600">{data.sessions.total}</div>
             <div className="text-sm text-gray-600">Total Sessions</div>
             {data.sessions.previousPeriod !== undefined && (
               <div className="mt-1 text-xs text-gray-500">
                 {(() => {
                   const change = calculatePercentageChange(data.sessions.total, data.sessions.previousPeriod);
                   if (!change) {
  return null;
 }
                   const isPositive = Number.parseFloat(change) > 0;
                   return (
                     <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                       {isPositive ? '+' : ''}
 {change}
 % vs previous
                     </span>
                   );
                 })()}
               </div>
             )}
           </CardContent>
         </Card>

         <Card>
           <CardContent className="p-4 text-center">
             <div className="text-2xl font-bold text-purple-600">{data.templates.total}</div>
             <div className="text-sm text-gray-600">Total Templates</div>
             {data.templates.previousPeriod !== undefined && (
               <div className="mt-1 text-xs text-gray-500">
                 {(() => {
                   const change = calculatePercentageChange(data.templates.total, data.templates.previousPeriod);
                   if (!change) {
  return null;
 }
                   const isPositive = Number.parseFloat(change) > 0;
                   return (
                     <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                       {isPositive ? '+' : ''}
 {change}
 % vs previous
                     </span>
                   );
                 })()}
               </div>
             )}
           </CardContent>
         </Card>
       </div>

      {/* Top Users */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Users by Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users by Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.sessions.byUser.slice(0, 5).map((item, index) => (
                <div key={item.userId || 'null'} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
#
{index + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {getUserDisplayName(item.userId)}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">{item.count}</div>
                </div>
              ))}
              {data.sessions.byUser.length === 0 && (
                <div className="py-4 text-center text-gray-500">No session data found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Users by Custom Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users by Custom Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.templates.byUser.slice(0, 5).map((item, index) => (
                <div key={item.ownerId || 'null'} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
#
{index + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {getUserDisplayName(item.ownerId)}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">{item.count}</div>
                </div>
              ))}
              {data.templates.byUser.length === 0 && (
                <div className="py-4 text-center text-gray-500">No custom template data found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

       {/* Recent Activities */}
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <CardTitle>Recent Activities</CardTitle>
             <div className="flex items-center space-x-2">
               {data.pagination.page > 1 && (
                 <Button
                   onClick={() => fetchAnalytics(currentPage - 1)}
                   variant="outline"
                   size="sm"
                 >
                   Previous
                 </Button>
               )}
               {data.pagination.hasMore && (
                 <Button
                   onClick={() => fetchAnalytics(currentPage + 1)}
                   variant="outline"
                   size="sm"
                 >
                   Next
                 </Button>
               )}
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <div className="space-y-3">
             {data.recentActivities.map(activity => (
               <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                 <div className="flex items-center space-x-3">
                   <div className="text-xl">
                     {getActivityIcon(activity.type)}
                   </div>
                   <div className="flex-1">
                     <div className="mb-1 flex items-center space-x-2">
                       <Badge className={getActivityColor(activity.type)}>
                         {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                       </Badge>
                       <span className="text-sm text-gray-600">
                         by
{' '}
{getUserDisplayName(activity.userId)}
                       </span>
                     </div>
                     <div className="text-sm text-gray-800">
                       {formatActivityDetails(activity)}
                     </div>
                   </div>
                 </div>
                 <div className="text-xs text-gray-500">
                   {new Date(activity.createdAt).toLocaleDateString()}
{' '}
{new Date(activity.createdAt).toLocaleTimeString()}
                 </div>
               </div>
             ))}
             {data.recentActivities.length === 0 && (
               <div className="py-8 text-center text-gray-500">
                 No recent activities found
               </div>
             )}
           </div>

           {data.recentActivities.length > 0 && (
             <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
               <span>
                 Page
{' '}
{data.pagination.page}
               </span>
               {data.pagination.hasMore && (
                 <span>• More activities available</span>
               )}
             </div>
           )}
         </CardContent>
       </Card>
    </div>
   );
 };
