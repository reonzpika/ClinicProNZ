export {};

// Extend Clerk's types with our custom metadata
declare global {
  // Import the consolidated UserRole type
  import type { UserRole } from '../src/shared/utils/roles';

  type CustomJwtSessionClaims = {
    metadata: {
      role?: UserRole;
    };
  };

  type UserPublicMetadata = {
    role?: UserRole;
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
    role?: UserRole;
    stripeCustomerId?: string;
    subscriptionId?: string;
    priceId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: string;
    assignedAt?: string;
    downgradedAt?: string;
  };
}
