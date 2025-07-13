import { redirect } from 'next/navigation';

import { RoleTestingDashboard } from '@/src/shared/components/admin/RoleTestingDashboard';
import { checkRole } from '@/src/shared/utils/roles';

// Force dynamic rendering since this page depends on user authentication
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Protect the page from users who are not admins
  const isAdmin = await checkRole('admin');
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="mb-6 text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>

              <div className="mb-6">
                <p className="text-gray-600">
                  This is the protected admin dashboard restricted to users with the
                  {' '}
                  <code className="rounded bg-gray-100 px-2 py-1">admin</code>
                  {' '}
                  role.
                </p>
              </div>

              {/* Role Testing Dashboard */}
              <RoleTestingDashboard />

              <div className="space-y-4">
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <h3 className="text-lg font-medium text-blue-900">Role Management</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    From here, admins can manage user roles and permissions.
                  </p>
                </div>

                <div className="rounded-md border border-green-200 bg-green-50 p-4">
                  <h3 className="text-lg font-medium text-green-900">System Analytics</h3>
                  <p className="mt-1 text-sm text-green-700">
                    View system-wide analytics and usage metrics.
                  </p>
                </div>

                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                  <h3 className="text-lg font-medium text-yellow-900">Configuration</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Manage application settings and configuration.
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900">RBAC & Rate Limiting Status</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded bg-green-100 p-3">
                    <span className="font-medium text-green-800">âœ… Role Utility</span>
                    <p className="text-sm text-green-700">Role helper functions implemented</p>
                  </div>
                  <div className="rounded bg-green-100 p-3">
                    <span className="font-medium text-green-800">âœ… Webhook Setup</span>
                    <p className="text-sm text-green-700">Auto-assigns 'signed_up' role</p>
                  </div>
                  <div className="rounded bg-green-100 p-3">
                    <span className="font-medium text-green-800">âœ… Middleware Protection</span>
                    <p className="text-sm text-green-700">Routes protected by role</p>
                  </div>
                  <div className="rounded bg-green-100 p-3">
                    <span className="font-medium text-green-800">âœ… React Components</span>
                    <p className="text-sm text-green-700">Role guards for UI elements</p>
                  </div>
                  <div className="rounded bg-blue-100 p-3">
                    <span className="font-medium text-blue-800">âœ… Rate Limiting</span>
                    <p className="text-sm text-blue-700">In-memory store, 24h windows</p>
                  </div>
                  <div className="rounded bg-blue-100 p-3">
                    <span className="font-medium text-blue-800">âœ… Role-based Limits</span>
                    <p className="text-sm text-blue-700">5/20/1000/âˆž requests per role</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href="/api/test-rate-limit"
                    target="_blank"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Test Rate Limits
                  </a>
                  <a
                    href="/api/admin/rate-limits"
                    target="_blank"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View Rate Statistics
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
