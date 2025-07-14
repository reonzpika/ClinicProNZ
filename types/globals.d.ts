export {};

// Extend Clerk's types with our custom metadata
declare global {
  // Import the consolidated UserTier type
  import type { UserTier } from '../src/shared/utils/roles';

  type CustomJwtSessionClaims = {
    metadata: {
      tier?: UserTier;
    };
  };

  type UserPublicMetadata = {
    tier?: UserTier;
    stripeCustomerId?: string;
    subscriptionId?: string;
    priceId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: string;
    assignedAt?: string;
    downgradedAt?: string;
  };

  // Add window.Clerk type declaration
  type Window = {
    Clerk?: {
      signOut: () => Promise<void>;
      openSignIn: () => void;
      openSignUp: () => void;
      user?: any;
      session?: any;
    };
  };
}

// Augment Clerk's User type to include our custom metadata
declare module '@clerk/nextjs' {
  type UserPublicMetadata = {
    tier?: UserTier;
    stripeCustomerId?: string;
    subscriptionId?: string;
    priceId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: string;
    assignedAt?: string;
    downgradedAt?: string;
  };
}
