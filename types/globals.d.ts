export {};

// Import the consolidated UserRole type
import type { UserRole } from '../src/shared/utils/roles';

// Extend Clerk's types with our custom metadata
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }

  interface UserPublicMetadata {
    role?: UserRole;
    stripeCustomerId?: string;
    subscriptionId?: string;
    priceId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: string;
    assignedAt?: string;
    downgradedAt?: string;
  }

  // Add window.Clerk type declaration
  interface Window {
    Clerk?: {
      signOut(): Promise<void>;
      openSignIn(): void;
      openSignUp(): void;
      user?: any;
      session?: any;
    };
  }
}

// Augment Clerk's User type to include our custom metadata
declare module '@clerk/nextjs' {
  interface UserPublicMetadata {
    role?: UserRole;
    stripeCustomerId?: string;
    subscriptionId?: string;
    priceId?: string;
    subscriptionStatus?: string;
    currentPeriodEnd?: string;
    assignedAt?: string;
    downgradedAt?: string;
  }
}
