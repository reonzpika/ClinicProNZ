'use client';

import { useEffect, useState } from 'react';

type SharesData = {
  totalShares: number;
  referralSignups: number;
  conversionRate: string;
  sharesByMethod: { method: string; count: number }[];
  sharesByLocation: { location: string; count: number }[];
};

export function ReferralImagesAnalytics() {
  const [data, setData] = useState<SharesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/referral-images/analytics/shares')
      .then((res) => {
        if (!res.ok) {
 throw new Error('Failed to fetch');
}
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        {error}
      </div>
    );
  }

  if (!data) {
 return null;
}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Total Shares</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{data.totalShares}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Referral Signups</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{data.referralSignups}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
{data.conversionRate}
%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Shares by Method</h2>
          {data.sharesByMethod.length === 0
? (
            <p className="text-sm text-gray-500">No share completions yet</p>
          )
: (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left font-medium text-gray-700">Method</th>
                  <th className="py-2 text-right font-medium text-gray-700">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.sharesByMethod.map(row => (
                  <tr key={row.method} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{row.method}</td>
                    <td className="py-2 text-right text-gray-600">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Shares by Location</h2>
          {data.sharesByLocation.length === 0
? (
            <p className="text-sm text-gray-500">No share events yet</p>
          )
: (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left font-medium text-gray-700">Location</th>
                  <th className="py-2 text-right font-medium text-gray-700">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.sharesByLocation.map(row => (
                  <tr key={row.location} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{row.location}</td>
                    <td className="py-2 text-right text-gray-600">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
