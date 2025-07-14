# Clerk Metadata Typing Fix

## Problem
Previously, accessing `user.publicMetadata.tier` was unsafe due to lack of TypeScript typing, leading to runtime errors and unsafe type casting.

## Solution
We've implemented a comprehensive tier-based RBAC system with proper TypeScript typing:

### Key Changes:
- **Type safety enforced** - No more unsafe casting
- **Unsafe type casting eliminated** (`as string`, `as UserTier`)
- **Consistent tier access** - Single source of truth for tier checking
- **Proper error handling** - Graceful fallbacks for missing tier data
- **Runtime validation** - Tier values are validated at runtime
- **Unified on `UserTier` type** from `src/shared/utils/roles.ts`

### Core Types:
```typescript
// src/shared/utils/roles.ts
export type UserTier = 'basic' | 'standard' | 'premium' | 'admin';

// globals.d.ts
declare global {
  interface UserPublicMetadata {
    tier?: UserTier;
  }
}
```

### Before (Unsafe):
```typescript
// ❌ Unsafe - no type checking
const tier = user?.publicMetadata?.tier as string;
const isAdmin = tier === 'admin'; // Could break if tier is undefined

// ❌ Unsafe type casting
const tier = user?.publicMetadata?.tier as UserTier;
```

### After (Safe):
```typescript
// ✅ Safe - proper typing and validation
const { getUserTier, hasTier } = useClerkMetadata();
const userTier = getUserTier(); // Properly typed as UserTier
const isAdmin = hasTier('admin'); // Safe boolean result

// ✅ Safe - TypeScript knows the type
user?.publicMetadata?.tier // TypeScript knows this is UserTier | undefined
```

## Implementation Details

### 1. Enhanced `useClerkMetadata` Hook
```typescript
// src/shared/hooks/useClerkMetadata.ts
export function useClerkMetadata() {
  const { user } = useUser();
  
  return {
    user,
    getUserTier,            // Get user tier safely
    hasTier,                // Hierarchical tier check
    isLoading: !user,
  };
}
```

### 2. Proper Usage Examples
```typescript
// In components:
const { getUserTier, hasTier } = useClerkMetadata();
const userTier = getUserTier();
const isAdmin = hasTier('admin');

// In API routes:
const tier = sessionClaims?.metadata?.tier || 'basic';
const hasAccess = TIER_HIERARCHY[tier] >= TIER_HIERARCHY.standard;
```

### 3. Migration Impact
- **All components** updated to use `UserTier` instead of `UserRole`
- **All API routes** updated to check tier directly from metadata
- **Billing system** updated to tier-based plans
- **Middleware** updated to use tier-based authentication
- **Testing system** updated to tier-based impersonation

## Benefits
1. **Type Safety**: No more runtime errors from undefined tier values
2. **Developer Experience**: Better autocomplete and compile-time error detection
3. **Maintainability**: Single source of truth for tier checking
4. **Performance**: Reduced need for type casting and validation
5. **Consistency**: Unified tier access pattern across the application

## Testing
The tier testing system has been updated to work with the new tier-based approach:
- **Tier Impersonation**: Frontend-only tier testing
- **Test User Login**: Full-stack tier testing with real accounts
- **Emergency Admin**: Tier promotion for recovery scenarios 