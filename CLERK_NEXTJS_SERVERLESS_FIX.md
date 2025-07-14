# Clerk + Next.js + Vercel Serverless Authentication Fix

## Problem
- Clerk auth works in development but fails in production
- `auth()` and `currentUser()` return `null` in server components
- Client-side hooks (`useAuth()`, `useUser()`) work fine
- API routes return 500 errors

## Root Cause
Vercel's serverless environment doesn't maintain persistent session state between function executions.

## Quick Identification

### Search for problematic patterns:
```bash
# Find server components using auth()
grep -r "auth()" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" .

# Find server components using currentUser()
grep -r "currentUser()" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" .
```

### Look for:
- Files importing `auth, currentUser` from `@clerk/nextjs`
- Files without `'use client'` directive
- Server components using authentication

## Solution: Convert Server Components to Client Components

### Before (❌ Broken in production):
```javascript
import { auth, currentUser } from '@clerk/nextjs';

export default async function Dashboard() {
  const { userId } = auth();
  const user = await currentUser();
  
  if (!userId) return <div>Please sign in</div>;
  return <div>Welcome, {user.firstName}!</div>;
}
```

### After (✅ Works in production):
```javascript
'use client';
import { useAuth, useUser } from '@clerk/nextjs';

export default function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!userId) return <div>Please sign in</div>;
  
  return <div>Welcome, {user?.firstName}!</div>;
}
```

## Key Changes Required

### 1. Add Client Directive
```javascript
'use client';
```

### 2. Update Imports
```javascript
// Change from:
import { auth, currentUser } from '@clerk/nextjs';

// To:
import { useAuth, useUser } from '@clerk/nextjs';
```

### 3. Remove Async & Update Function Calls
```javascript
// Change from:
export default async function Component() {
  const { userId } = auth();
  const user = await currentUser();

// To:
export default function Component() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
```

### 4. Add Loading States
```javascript
if (!isLoaded) return <div>Loading...</div>;
```

### 5. Use Optional Chaining
```javascript
// Change from:
<div>{user.firstName}</div>

// To:
<div>{user?.firstName}</div>
```

## Alternative: Move Logic to API Routes

### Create API Route:
```javascript
// app/api/user-data/route.js
import { auth, currentUser } from '@clerk/nextjs';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await currentUser();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
```

### Call from Client Component:
```javascript
'use client';
import { useEffect, useState } from 'react';

export default function Component() {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    fetch('/api/user-data')
      .then(res => res.json())
      .then(setUserData);
  }, []);
  
  return <div>{userData?.user?.firstName}</div>;
}
```

## Migration Checklist

### Phase 1: Identify
- [ ] Find all files using `auth()` or `currentUser()`
- [ ] List all server components with authentication
- [ ] Check API routes for auth usage

### Phase 2: Convert
- [ ] Add `'use client';` to affected files
- [ ] Update imports (`auth` → `useAuth`)
- [ ] Remove `async` from functions
- [ ] Add loading states with `isLoaded`
- [ ] Use optional chaining for user properties

### Phase 3: Test
- [ ] Test locally with `npm run dev`
- [ ] Test production build with `npm run build && npm run start`
- [ ] Deploy to staging/preview
- [ ] Test in production environment

## Common Patterns

### Protected Route:
```javascript
'use client';
export default function ProtectedPage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!userId) return <div>Please sign in</div>;
  
  return <div>Protected content for {user?.firstName}</div>;
}
```

### Conditional Rendering:
```javascript
'use client';
export default function Component() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  return (
    <div>
      {userId ? (
        <div>Welcome, {user?.firstName}!</div>
      ) : (
        <div>Please sign in</div>
      )}
    </div>
  );
}
```

## Best Practices

1. **Always handle loading states**: Check `isLoaded` before rendering
2. **Use optional chaining**: `user?.firstName` instead of `user.firstName`
3. **Add error boundaries**: Wrap components in error boundaries
4. **Test thoroughly**: Test in both development and production

## Quick Debug

Add these console logs to debug:
```javascript
console.log('Auth loaded:', isLoaded);
console.log('User ID:', userId);
console.log('User data:', user);
```

## Summary

**The fix is simple**: Convert server components using Clerk auth to client components and use hooks instead of functions. This ensures authentication works reliably in Vercel's serverless environment.

**Key transformation**: `auth()` → `useAuth()` and `currentUser()` → `useUser()` with proper loading states.