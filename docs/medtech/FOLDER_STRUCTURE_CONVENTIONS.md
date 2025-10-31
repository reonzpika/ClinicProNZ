# Medtech Integration - Folder Structure Conventions

**Date**: 2025-10-31  
**Status**: Active  
**Decision**: Use `src/medtech/` for Medtech product code (separate from `src/features/` ClinicPro code)

---

## File Path vs Route Path vs Import Path

### **Route Groups in Next.js App Router**

Route groups like `(integration)`, `(clinical)`, `(admin)` are **organizational only** — they **do NOT appear in URLs**.

**Example**:
```
File path:     app/(integration)/medtech-images/page.tsx
URL:           /medtech-images
Import path:   @/app/(integration)/medtech-images/page  (rarely needed)
```

### **When Documenting Routes**

✅ **Use URL path** (what users see):
- `/medtech-images` (desktop)
- `/medtech-images/mobile` (mobile QR handoff)

❌ **Don't use** file path with route groups in docs:
- ~~`app/(integration)/medtech-images/page.tsx`~~ (only for file system reference)

✅ **Exception**: When specifically discussing file structure, use full path:
- "The desktop page is located at `app/(integration)/medtech-images/page.tsx`"

---

## Folder Structure Overview

```
/workspace/
├── app/
│   ├── (integration)/                    # Route group (not in URL)
│   │   └── medtech-images/               # → URL: /medtech-images
│   │       ├── page.tsx                  # → URL: /medtech-images
│   │       ├── layout.tsx
│   │       └── mobile/
│   │           └── page.tsx              # → URL: /medtech-images/mobile
│   │
│   └── api/
│       └── (integration)/                # Route group (not in URL)
│           └── medtech/                  # → URL: /api/medtech/*
│               ├── capabilities/
│               │   └── route.ts          # → URL: /api/medtech/capabilities
│               ├── mobile/
│               │   └── initiate/
│               │       └── route.ts      # → URL: /api/medtech/mobile/initiate
│               └── attachments/
│                   ├── upload-initiate/
│                   │   └── route.ts      # → URL: /api/medtech/attachments/upload-initiate
│                   └── commit/
│                       └── route.ts      # → URL: /api/medtech/attachments/commit
│
├── src/
│   ├── medtech/                          # ⭐ Medtech product namespace
│   │   ├── images-widget/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   └── shared/
│   │
│   ├── features/                         # ClinicPro features
│   │   ├── clinical/
│   │   ├── templates/
│   │   └── admin/
│   │
│   ├── lib/
│   │   └── services/
│   │       └── medtech/                  # Infrastructure (OAuth, ALEX client)
│   │
│   └── shared/                           # Shared across all products
```

---

## Import Path Conventions

### **1. Medtech Widget Components**

```typescript
// Desktop page
import { CapturePanel } from '@/src/medtech/images-widget/components/desktop/CapturePanel';
import { GalleryGrid } from '@/src/medtech/images-widget/components/desktop/GalleryGrid';
import { MetadataChips } from '@/src/medtech/images-widget/components/desktop/MetadataChips';

// Hooks
import { useCapabilities } from '@/src/medtech/images-widget/hooks/useCapabilities';
import { useCommit } from '@/src/medtech/images-widget/hooks/useCommit';
import { useImageCompression } from '@/src/medtech/images-widget/hooks/useImageCompression';

// Services
import { mockMedtechAPI } from '@/src/medtech/images-widget/services/mock-medtech-api';
import { compressImage } from '@/src/medtech/images-widget/services/compression';

// Store
import { useImageWidgetStore } from '@/src/medtech/images-widget/stores/imageWidgetStore';

// Types
import type { WidgetImage, CommitRequest, Capabilities } from '@/src/medtech/images-widget/types';
```

### **2. Medtech Infrastructure (OAuth, ALEX client)**

```typescript
// API routes or server components
import { alexApiClient } from '@/src/lib/services/medtech/alex-api-client';
import { oauthTokenService } from '@/src/lib/services/medtech/oauth-token-service';
import { generateCorrelationId } from '@/src/lib/services/medtech/correlation-id';
import type { FhirMedia, FhirBundle } from '@/src/lib/services/medtech/types';
```

### **3. ClinicPro Features (existing)**

```typescript
// Existing ClinicPro code (unchanged)
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Container } from '@/src/shared/components/layout/Container';
import { ImageSessionBar } from '@/src/features/clinical/session-management/components/ImageSessionBar';
```

### **4. Shared Components/Utils**

```typescript
// UI components (shadcn/ui)
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/src/shared/components/ui/card';
import { useToast } from '@/src/shared/components/ui/toast';

// Shared utilities
import { createAuthHeaders } from '@/src/shared/utils';
```

---

## Naming Conventions

### **File Names**

- **Components**: PascalCase (`CapturePanel.tsx`, `MetadataChips.tsx`)
- **Hooks**: camelCase with `use` prefix (`useImageCompression.ts`, `useCommit.ts`)
- **Services**: camelCase (`compression.ts`, `validation.ts`, `mock-medtech-api.ts`)
- **Stores**: camelCase with `Store` suffix (`imageWidgetStore.ts`)
- **Types**: camelCase (`index.ts`, `capabilities.ts`)
- **API Routes**: kebab-case folders + `route.ts` (`upload-initiate/route.ts`)

### **Component Names**

- **Desktop**: `<ComponentName>` (e.g., `<CapturePanel>`, `<GalleryGrid>`)
- **Mobile**: `<ComponentName>` (e.g., `<CaptureFlow>`, `<ReviewGrid>`)
- **Shared**: Prefix with `Medtech` if Medtech-specific (`<MedtechHeader>`, `<MedtechErrorBoundary>`)

### **Hook Names**

- **Widget-specific**: `use<Action>` (e.g., `useCommit`, `useCapabilities`)
- **Generic reusable**: `use<Noun><Action>` (e.g., `useImageCompression`, `useQRSession`)

---

## Import Path Quick Reference

| Type | Path Pattern | Example |
|------|--------------|---------|
| **Medtech Widget Component** | `@/src/medtech/images-widget/components/...` | `@/src/medtech/images-widget/components/desktop/CapturePanel` |
| **Medtech Widget Hook** | `@/src/medtech/images-widget/hooks/...` | `@/src/medtech/images-widget/hooks/useCommit` |
| **Medtech Widget Service** | `@/src/medtech/images-widget/services/...` | `@/src/medtech/images-widget/services/compression` |
| **Medtech Widget Store** | `@/src/medtech/images-widget/stores/...` | `@/src/medtech/images-widget/stores/imageWidgetStore` |
| **Medtech Widget Types** | `@/src/medtech/images-widget/types` | `@/src/medtech/images-widget/types` |
| **Medtech Infrastructure** | `@/src/lib/services/medtech/...` | `@/src/lib/services/medtech/alex-api-client` |
| **ClinicPro Feature** | `@/src/features/<feature>/...` | `@/src/features/clinical/session-management/...` |
| **Shared UI** | `@/src/shared/components/ui/...` | `@/src/shared/components/ui/button` |
| **Shared Utils** | `@/src/shared/utils/...` | `@/src/shared/utils` |

---

## API Route Reference

| Endpoint | File Path | Purpose |
|----------|-----------|---------|
| `GET /api/medtech/capabilities` | `app/api/(integration)/medtech/capabilities/route.ts` | Feature flags, coded value lists |
| `POST /api/medtech/mobile/initiate` | `app/api/(integration)/medtech/mobile/initiate/route.ts` | Generate QR token for mobile |
| `POST /api/medtech/attachments/upload-initiate` | `app/api/(integration)/medtech/attachments/upload-initiate/route.ts` | Prepare file metadata |
| `POST /api/medtech/attachments/commit` | `app/api/(integration)/medtech/attachments/commit/route.ts` | Commit images to ALEX FHIR |
| `GET /api/medtech/test` | `app/api/(integration)/medtech/test/route.ts` | ✅ Exists: Test OAuth + FHIR connectivity |
| `GET /api/medtech/token-info` | `app/api/(integration)/medtech/token-info/route.ts` | ✅ Exists: Token cache status |

---

## Environment Variables

```bash
# Mock mode (development)
NEXT_PUBLIC_MEDTECH_USE_MOCK=true

# Medtech ALEX API (production)
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=<secret>
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E
MEDTECH_APP_ID=clinicpro-images-widget
```

---

## Key Principles

### **1. Separation of Concerns**

- **`src/medtech/`** → Medtech product UI/features
- **`src/lib/services/medtech/`** → Infrastructure (OAuth, ALEX client, FHIR types)
- **`src/features/`** → ClinicPro features
- **`src/shared/`** → Shared across all products

### **2. No Cross-Product Imports**

❌ **Never import ClinicPro features into Medtech**:
```typescript
// BAD - Medtech widget importing ClinicPro feature
import { useConsultationStores } from '@/src/features/clinical/...';
```

❌ **Never import Medtech widget into ClinicPro**:
```typescript
// BAD - ClinicPro feature importing Medtech widget
import { useCommit } from '@/src/medtech/images-widget/hooks/useCommit';
```

✅ **Use shared code via `src/shared/`**:
```typescript
// GOOD - Both products import from shared
import { Button } from '@/src/shared/components/ui/button';
```

✅ **Infrastructure can be used by both** (OAuth, ALEX client):
```typescript
// GOOD - Both Medtech widget and API routes use infrastructure
import { alexApiClient } from '@/src/lib/services/medtech/alex-api-client';
```

### **3. Future-Proof Structure**

When adding more Medtech products:
```
src/
├── medtech/
│   ├── images-widget/          # Current
│   ├── referrals/              # Future
│   ├── prescriptions/          # Future
│   └── shared/                 # Shared across Medtech products only
```

---

## Documentation Conventions

### **When referring to routes**:
✅ Use URL path: `/medtech-images`, `/api/medtech/capabilities`  
❌ Don't use file path: ~~`app/(integration)/medtech-images/page.tsx`~~

### **When referring to components**:
✅ Use import path: `@/src/medtech/images-widget/components/desktop/CapturePanel`  
❌ Don't use relative path: ~~`../../../medtech/images-widget/...`~~

### **When referring to file location**:
✅ Use full file path: `app/(integration)/medtech-images/page.tsx`  
✅ Explain route group: "Located at `app/(integration)/medtech-images/page.tsx` (route group doesn't appear in URL)"

---

## Quick Start

### **Creating a new Medtech component**:
```bash
# Desktop component
touch src/medtech/images-widget/components/desktop/NewComponent.tsx

# Mobile component
touch src/medtech/images-widget/components/mobile/NewMobileComponent.tsx

# Shared component (used by both desktop and mobile)
touch src/medtech/shared/components/SharedComponent.tsx
```

### **Creating a new hook**:
```bash
touch src/medtech/images-widget/hooks/useNewHook.ts
```

### **Creating a new API route**:
```bash
mkdir -p app/api/(integration)/medtech/new-route
touch app/api/(integration)/medtech/new-route/route.ts
```

---

**Questions?** Refer to:
- [README.md](./README.md) — Project overview
- [NEXT_STEPS.md](./NEXT_STEPS.md) — Current status and tasks
- [images-widget-prd.md](./images-widget-prd.md) — Product requirements
