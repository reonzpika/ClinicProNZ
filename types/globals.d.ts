export {};

// Create a type for the roles
export type Roles = 'public' | 'signed_up' | 'standard' | 'admin';

declare global {
  type CustomJwtSessionClaims = {
    metadata: {
      role?: Roles;
    };
  };

  type UserPublicMetadata = {
    role?: Roles;
  };
}
