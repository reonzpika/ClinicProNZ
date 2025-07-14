'use client';

import { useAuth } from '@clerk/nextjs';
import { AlertTriangle, Crown, Loader2, UserPlus, Zap } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { BILLING_CONFIG } from '@/src/shared/utils/billing-config';

type RateLimitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  error: {
    limit: number;
    resetIn: number;
    message: string;
  };
};

export function RateLimitModal({ isOpen, onClose, error }: RateLimitModalProps) {
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'signup' | 'upgrade' | null>(null);

  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  const isPublicUser = !isSignedIn;
  const isBasicUser = isSignedIn && userTier === 'basic';

  const resetTimeMinutes = Math.ceil(error.resetIn / 1000 / 60);
  const standardPlan = BILLING_CONFIG.plans.standard;
  // Remove this line - rateLimits no longer exists
  // const standardRateLimits = BILLING_CONFIG.rateLimits.standard;

  // Use session-based limits from new system
  const basicSessionLimit = 5;
  const standardSessionLimit = 'unlimited';

  const handleSignUp = () => {
    setLoadingAction('signup');
    setIsLoading(true);
    // Redirect to Clerk sign up
    window.location.href = '/register';
  };

  const handleUpgrade = async (userEmail?: string) => {
    setLoadingAction('upgrade');
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail || user?.primaryEmailAddress?.emailAddress,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false);
      setLoadingAction(null);
      // Show error message or toast
    }
  };

  const handlePublicUpgrade = () => {
    if (!email) {
      return;
    }
    handleUpgrade(email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="rounded-full bg-orange-100 p-2">
              <AlertTriangle className="size-5 text-orange-600" />
            </div>
            <span className="text-lg">Session Limit Reached</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current limit info */}
          <div className="rounded-lg bg-orange-50 p-4">
            <p className="text-sm text-orange-800">
              <strong>
                You've used all
                {' '}
                {error.limit}
                {' '}
                sessions
              </strong>
              {' '}
              for today.
              Your limit resets in
              <strong>
                {resetTimeMinutes}
                {' '}
                minutes
              </strong>
              .
            </p>
          </div>

          {/* Public user options */}
          {isPublicUser && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="mb-4 text-sm text-gray-600">
                  Get more sessions by creating an account or upgrading:
                </p>
              </div>

              {/* Free signup option */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">Free Account</h4>
                    <p className="text-sm text-blue-700">
                      {basicSessionLimit}
                      {' '}
                      sessions/day
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={handleSignUp}
                    disabled={isLoading}
                  >
                    {loadingAction === 'signup'
                      ? (
                          <Loader2 className="size-4 animate-spin" />
                        )
                      : (
                          <>
                            <UserPlus className="mr-1 size-3" />
                            Sign Up Free
                          </>
                        )}
                  </Button>
                </div>
              </div>

              {/* Direct upgrade option */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="flex items-center gap-1 font-semibold text-green-900">
                        <Crown className="size-4" />
                        {standardPlan.name}
                        {' '}
                        Plan
                      </h4>
                      <p className="text-sm text-green-700">
                        {standardSessionLimit}
                        {' '}
                        sessions/day • $
                        {standardPlan.price}
                        /month
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-green-800">
                      Email for checkout:
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="border-green-300 focus:border-green-500"
                    />
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handlePublicUpgrade}
                    disabled={!email || isLoading}
                  >
                    {loadingAction === 'upgrade'
                      ? (
                          <Loader2 className="size-4 animate-spin" />
                        )
                      : (
                          <>
                            <Zap className="mr-1 size-3" />
                            Upgrade Now
                          </>
                        )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Basic tier user options */}
          {isBasicUser && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="mb-4 text-sm text-gray-600">
                  Upgrade to Standard for unlimited AI-powered consultations:
                </p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="flex items-center gap-1 font-semibold text-green-900">
                        <Crown className="size-4" />
                        {standardPlan.name}
                        {' '}
                        Plan
                      </h4>
                      <p className="text-sm text-green-700">
                        {standardSessionLimit}
                        {' '}
                        sessions/day • $
                        {standardPlan.price}
                        /month
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-1 text-sm text-green-700">
                    {standardPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpgrade()}
                    disabled={isLoading}
                  >
                    {loadingAction === 'upgrade'
                      ? (
                          <Loader2 className="size-4 animate-spin" />
                        )
                      : (
                          <>
                            <Zap className="mr-1 size-3" />
                            Upgrade to Standard
                          </>
                        )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Continue waiting option */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onClose}
              disabled={isLoading}
            >
              Continue Later (Reset in
              {' '}
              {resetTimeMinutes}
              {' '}
              min)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
