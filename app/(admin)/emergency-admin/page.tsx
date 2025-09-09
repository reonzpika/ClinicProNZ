'use client';

import { useUser } from '@clerk/nextjs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { useState } from 'react';

import { Alert, AlertDescription } from '@/src/shared/components/ui/alert';
import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

export default function EmergencyAdminPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const currentTier = user?.publicMetadata?.tier as string || 'basic';

  const handleMakeAdmin = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin status');
      }

      const result = await response.json();
      setMessage(result.message || 'Admin status updated successfully');

      // Reload the page to reflect the new admin status
      window.location.reload();
    } catch (error) {
      console.error('Error updating admin status:', error);
      setMessage('Error updating admin status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-red-600">
            🚨 Emergency Admin Access
          </h1>
          <p className="text-gray-600">
            Emergency access for admin tier promotion and system recovery
          </p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">User ID:</span>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                  {user?.id || 'Not available'}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Email:</span>
                <span>{user?.primaryEmailAddress?.emailAddress || 'Not available'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Tier:</span>
                <Badge variant={currentTier === 'admin' ? 'destructive' : 'secondary'}>
                  {currentTier}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">⚠️ Admin Actions</CardTitle>
            <CardDescription>
              Use these actions carefully. They have immediate effect on user permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Make Admin */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Promote to Admin Tier</h3>
                  <p className="text-sm text-gray-600">
                    Grants full admin tier access to your current user account
                  </p>
                </div>
                <Button
                  onClick={handleMakeAdmin}
                  disabled={isLoading || currentTier === 'admin'}
                  variant="destructive"
                  size="sm"
                >
                  {isLoading ? 'Updating...' : 'Make Admin'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Display */}
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Warning */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>• This page is for emergency admin access only</li>
              <li>• Changes take effect immediately</li>
              <li>• Admin tier grants full system access</li>
              <li>• Use responsibly and only when necessary</li>
              <li>• All actions are logged for security</li>
            </ul>
          </CardContent>
        </Card>

        {/* Access Info */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Access Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong>How to Access:</strong>
                <p className="text-gray-600">
                  This page is accessible to all authenticated users for emergency admin promotion.
                </p>
              </div>
              <div>
                <strong>When to Use:</strong>
                <p className="text-gray-600">
                  Use when you need admin access but don't currently have it, or when recovering from tier issues.
                </p>
              </div>
              <div>
                <strong>Security:</strong>
                <p className="text-gray-600">
                  All admin promotions are logged. Only use this for legitimate administrative needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
