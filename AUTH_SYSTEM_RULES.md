# Authentication & Authorization System Rules

## **Overview**
This document defines the complete authentication and authorization rules for the ClinicPro application. Use this as the definitive reference for implementing auth-related features.

## **🏗️ System Architecture**

### **Authentication Pattern: Client-Side Headers**
- **Primary**: Client-side auth headers (solves Vercel serverless issues)
- **Secondary**: Mobile QR token authentication for mobile devices
- **Fallback**: Guest tokens for unauthenticated users

### **Authorization Model: RBAC (Role-Based Access Control)**
- **Tier-based permissions** (basic, standard, premium, admin)
- **Session limits** enforced per tier
- **Feature access** controlled by tier level
- **Resource quotas** managed per user/guest

---

## **👥 User Types & Authentication**

### **1. Authenticated Users** 
```typescript
// Headers sent to API
{
  'x-user-id': string,           // Clerk user ID
  'x-user-tier': UserTier,       // User's subscription tier
  'Content-Type': 'application/json'
}
```

**Auth Context:**
- **Source**: Clerk authentication service
- **Identity**: Permanent user account with subscription
- **Permissions**: Based on subscription tier
- **Session Tracking**: By user ID

### **2. Guest Users**
```typescript
// Headers sent to API  
{
  'x-guest-token': string,       // Temporary session token
  'Content-Type': 'application/json'
}
```

**Auth Context:**
- **Source**: Generated guest token (anonymous)
- **Identity**: Temporary session (no account)
- **Permissions**: Limited basic tier access
- **Session Tracking**: By guest token

### **3. Mobile Device Users**
```typescript
// Mobile QR code authentication
{
  'x-mobile-token': string,      // QR-generated device token
  'Content-Type': 'application/json'
}
```

**Auth Context:**
- **Source**: QR code token exchange
- **Identity**: Device-specific session
- **Permissions**: Linked to desktop user's tier
- **Session Tracking**: By mobile token

---

## **🎯 User Tiers & Permissions**

### **Tier Hierarchy**
```typescript
['basic', 'standard', 'premium', 'admin'] // Index = permission level
```

### **Tier Definitions**

#### **Basic Tier** (Free/Default)
```typescript
{
  coreSessions: 5,               // Limited consultation sessions
  premiumActions: 5,             // Limited AI operations  
  templateManagement: false,     // Cannot create custom templates
  sessionManagement: false,      // Cannot manage patient sessions
}
```

**Access:**
- ✅ Basic consultation notes
- ✅ Audio transcription (limited)
- ✅ Default templates (read-only)
- ❌ Custom template creation
- ❌ Advanced AI features
- ❌ Session management

#### **Standard Tier** (Paid Subscription)
```typescript
{
  coreSessions: -1,              // Unlimited sessions
  premiumActions: 5,             // Limited premium features
  templateManagement: true,      // Can create custom templates
  sessionManagement: true,       // Can manage patient sessions
}
```

**Access:**
- ✅ Unlimited consultation sessions
- ✅ Custom template creation/editing
- ✅ Patient session management
- ✅ Basic AI image analysis
- ❌ Advanced AI features (limited quota)

#### **Premium Tier** (Higher Subscription)
```typescript
{
  coreSessions: -1,              // Unlimited sessions
  premiumActions: 100,           // High limit on premium features
  templateManagement: true,      // Full template access
  sessionManagement: true,       // Full session management
}
```

**Access:**
- ✅ All Standard features
- ✅ High-volume premium AI operations
- ✅ Advanced clinical image analysis
- ✅ Priority processing
- ✅ Advanced integrations

#### **Admin Tier** (System Administrator)
```typescript
{
  coreSessions: -1,              // Unlimited
  premiumActions: -1,            // Unlimited
  templateManagement: true,      // Full access
  sessionManagement: true,       // Full access + admin controls
}
```

**Access:**
- ✅ All system features
- ✅ User management
- ✅ System diagnostics
- ✅ Billing administration
- ✅ Emergency admin functions

---

## **🔒 Authentication Implementation**

### **Client-Side Auth Pattern**
```typescript
// REQUIRED: Use this pattern for ALL API calls

// 1. Get auth context in components
const { userId } = useAuth();
const { getUserTier } = useClerkMetadata();
const userTier = getUserTier();
const { getEffectiveGuestToken } = useConsultation();

// 2. Create standardised headers
const effectiveGuestToken = getEffectiveGuestToken();
const headers = createAuthHeadersWithGuest(userId, userTier, effectiveGuestToken);

// 3. Make API call
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers, // Use standardised headers
  body: JSON.stringify(data)
});
```

### **Server-Side Auth Extraction**
```typescript
// API routes extract auth context from headers
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function POST(req: Request) {
  // Extract auth context from client headers
  const context = await extractRBACContext(req);
  
  // context.userId: string | null
  // context.guestToken: string | null  
  // context.tier: UserTier
  // context.isAuthenticated: boolean
}
```

---

## **🛡️ Authorization Rules**

### **Session Limits**
```typescript
// Check session limits before processing
const permissionCheck = await checkCoreSessionLimit(context);

if (!permissionCheck.allowed) {
  return NextResponse.json({
    code: 'SESSION_LIMIT_EXCEEDED',
    message: permissionCheck.reason,
    upgradePrompt: permissionCheck.upgradePrompt,
    remaining: permissionCheck.remaining,
    resetTime: permissionCheck.resetTime
  }, { status: 429 });
}
```

### **Feature Access Control**
```typescript
// Template management access
import { canAccessTemplates } from '@/src/lib/rbac-client';

if (!canAccessTemplates(context.tier)) {
  return NextResponse.json({
    code: 'TIER_INSUFFICIENT', 
    message: 'Template management requires Standard tier or higher'
  }, { status: 403 });
}
```

### **Tier Hierarchy Checks**
```typescript
// Check if user has required tier or higher
import { TIER_HIERARCHY } from '@/src/shared/utils/roles';

const hasTier = (userTier: UserTier, requiredTier: UserTier): boolean => {
  const userIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

// Usage
if (!hasTier(context.tier, 'standard')) {
  return NextResponse.json({ 
    code: 'INSUFFICIENT_TIER' 
  }, { status: 403 });
}
```

---

## **🚀 API Endpoint Auth Patterns**

### **Public Endpoints** (No Auth Required)
```typescript
// Examples: /api/templates (GET), health checks
export async function GET(req: Request) {
  // No auth required - public data
  return NextResponse.json({ data: publicData });
}
```

### **Guest-Allowed Endpoints** (Basic Auth)
```typescript
// Examples: /api/consultation/notes, /api/deepgram/transcribe
export async function POST(req: Request) {
  const context = await extractRBACContext(req);
  
  // Allow both authenticated and guest users
  if (!context.userId && !context.guestToken) {
    return NextResponse.json({ code: 'AUTH_REQUIRED' }, { status: 401 });
  }
  
  // Check session limits
  const permissionCheck = await checkCoreSessionLimit(context);
  if (!permissionCheck.allowed) {
    return NextResponse.json({ code: 'LIMIT_EXCEEDED' }, { status: 429 });
  }
  
  // Process request...
}
```

### **Authenticated-Only Endpoints** (User Account Required)
```typescript
// Examples: /api/templates (POST/PATCH), /api/user/settings
export async function POST(req: Request) {
  const context = await extractRBACContext(req);
  
  // Require authenticated user
  if (!context.isAuthenticated) {
    return NextResponse.json({ code: 'AUTH_REQUIRED' }, { status: 401 });
  }
  
  // Check tier requirements
  if (!hasTier(context.tier, 'standard')) {
    return NextResponse.json({ code: 'TIER_REQUIRED' }, { status: 403 });
  }
  
  // Process request...
}
```

### **Admin-Only Endpoints** (Admin Tier Required)
```typescript
// Examples: /api/admin/*, /api/webhooks/*, emergency functions
export async function POST(req: Request) {
  const context = await extractRBACContext(req);
  
  // Require admin tier
  if (!context.isAuthenticated || context.tier !== 'admin') {
    return NextResponse.json({ code: 'ADMIN_REQUIRED' }, { status: 403 });
  }
  
  // Process admin request...
}
```

---

## **📱 Mobile Authentication**

### **QR Code Flow**
1. **Desktop**: Generate mobile token with user auth context
2. **Mobile**: Scan QR code to get token
3. **Mobile**: Use token for API authentication
4. **Server**: Link mobile session to desktop user's tier

### **Mobile Token Headers**
```typescript
// Mobile device sends
{
  'x-mobile-token': string,      // QR-generated token
  'Content-Type': 'application/json'
}

// Server resolves to user context
{
  userId: string,                // Linked desktop user
  tier: UserTier,               // User's subscription tier  
  deviceId: string,             // Mobile device identifier
}
```

---

## **⚠️ Security Rules**

### **Header Validation**
- ✅ **Always validate auth headers** in API routes
- ✅ **Sanitise user input** before using in auth checks
- ✅ **Check token expiration** for guest and mobile tokens
- ❌ **Never trust client-side tier claims** without validation

### **Session Management**
- ✅ **Track session usage** by user ID or guest token
- ✅ **Enforce rate limits** per tier
- ✅ **Clean up expired sessions** regularly
- ❌ **Never allow session sharing** between users

### **Error Handling**
```typescript
// Standard error responses
{
  code: 'AUTH_REQUIRED' | 'TIER_INSUFFICIENT' | 'SESSION_LIMIT_EXCEEDED' | 'INVALID_TOKEN',
  message: string,
  upgradePrompt?: string,    // For tier upgrade suggestions
  remaining?: number,        // Sessions remaining
  resetTime?: Date,         // When limits reset
}
```

---

## **🔧 Development Guidelines**

### **MUST DO ✅**
1. **Always use `createAuthHeadersWithGuest()`** for API calls
2. **Import auth context** in all components making API requests
3. **Extract RBAC context** in all API route handlers
4. **Check session limits** before processing requests
5. **Handle auth errors** gracefully with user-friendly messages

### **NEVER DO ❌**
1. **Manual header construction** (`{ 'Content-Type': 'application/json' }`)
2. **Skip auth checks** in API routes
3. **Trust client-side tier information** without validation
4. **Hard-code tier requirements** (use configuration)
5. **Ignore session limits** for any user type

### **Component Auth Pattern**
```typescript
// Standard component setup
import { useAuth } from '@clerk/nextjs';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';
import { useConsultation } from '@/src/shared/ConsultationContext';

export function MyComponent() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const { getEffectiveGuestToken } = useConsultation();
  
  const handleApiCall = async () => {
    const effectiveGuestToken = getEffectiveGuestToken();
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: createAuthHeadersWithGuest(userId, userTier, effectiveGuestToken),
      body: JSON.stringify(data)
    });
  };
}
```

### **API Route Auth Pattern**
```typescript
// Standard API route setup
import { extractRBACContext, checkCoreSessionLimit } from '@/src/lib/rbac-enforcer';

export async function POST(req: Request) {
  const context = await extractRBACContext(req);
  
  // Auth validation
  if (!context.userId && !context.guestToken) {
    return NextResponse.json({ code: 'AUTH_REQUIRED' }, { status: 401 });
  }
  
  // Permission checks
  const permissionCheck = await checkCoreSessionLimit(context);
  if (!permissionCheck.allowed) {
    return NextResponse.json({ 
      code: 'SESSION_LIMIT_EXCEEDED',
      message: permissionCheck.reason 
    }, { status: 429 });
  }
  
  // Business logic...
}
```

---

## **📊 Monitoring & Analytics**

### **Auth Metrics to Track**
- Session usage by tier
- Rate limit violations
- Authentication failures
- Tier upgrade triggers
- Guest-to-user conversion rates

### **Debug Information**
```typescript
// Include in API responses for debugging
{
  debug: {
    userId: context.userId,
    tier: context.tier, 
    isAuthenticated: context.isAuthenticated,
    sessionCount: permissionCheck.remaining,
    resetTime: permissionCheck.resetTime
  }
}
```

---

## **🔄 Migration & Updates**

### **Adding New Tiers**
1. Update `UserTier` type in `src/shared/utils/roles.ts`
2. Add tier configuration in `TIER_LIMITS` in `src/lib/rbac-client.ts`
3. Update `TIER_HIERARCHY` array
4. Update billing configuration
5. Test all tier-dependent features

### **Changing Permissions**
1. Update `SessionLimits` type if needed
2. Modify `TIER_LIMITS` configuration
3. Update API route permission checks
4. Test affected endpoints
5. Update documentation

### **Adding New Auth Types**
1. Extend `RBACContext` type
2. Update `extractRBACContext()` function
3. Add new header extraction logic
4. Update client-side auth utilities
5. Test integration end-to-end

---

## **❓ Troubleshooting**

### **Common Auth Issues**
- **Missing headers**: Component not using `createAuthHeadersWithGuest()`
- **Wrong tier**: User tier not synced with Clerk metadata
- **Session limits**: User hitting tier-based quotas
- **Guest token**: Invalid or expired guest token

### **Debug Steps**
1. Check browser network tab for request headers
2. Verify `extractRBACContext()` output in API logs
3. Confirm user tier in Clerk dashboard
4. Test with different user types (auth/guest/mobile)
5. Validate session limit calculations

---

**Last Updated**: Phase 2 Auth Standardisation Complete  
**Status**: Production Ready ✅  
**Compatibility**: All Vercel serverless environments