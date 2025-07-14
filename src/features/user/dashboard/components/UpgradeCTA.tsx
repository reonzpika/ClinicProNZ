'use client';

import { ArrowRight, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';

export default function UpgradeCTA() {
  const { getUserTier } = useClerkMetadata();
  const tier = getUserTier();

  // Only show for basic tier users
  if (tier !== 'basic') {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
              <Crown className="size-5 text-blue-600" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Unlock Full Potential
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              Upgrade to Standard for 1000 requests/day and priority support
            </p>
          </div>

          <div className="shrink-0">
            <Button
              asChild
              size="sm"
              className="h-auto bg-blue-600 px-3 py-1.5 text-xs hover:bg-blue-700"
            >
              <Link href="/billing" className="flex items-center gap-1">
                <Zap className="size-3" />
                Upgrade
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-3 border-t border-blue-200 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <div className="size-1.5 rounded-full bg-green-500"></div>
              1000 requests/day
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <div className="size-1.5 rounded-full bg-green-500"></div>
              Priority support
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <div className="size-1.5 rounded-full bg-green-500"></div>
              All templates
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <div className="size-1.5 rounded-full bg-green-500"></div>
              Advanced features
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
