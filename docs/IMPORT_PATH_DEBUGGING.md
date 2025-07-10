# Import Path Debugging Reference

## Overview
This document captures consistent error patterns found in ClinicPro's codebase during the RAG feature implementation and provides systematic debugging approaches.

## Common Import Path Issues

### 1. Ambiguous Path Alias Conflicts

**Problem**: TypeScript path alias `@/*` maps to multiple directories:
```json
"paths": {
  "@/*": ["./src/*", "./app/*", "./database/*"]
}
```

**Symptoms**:
- Import resolution errors in TypeScript compilation
- "Cannot find module" errors for database imports
- Inconsistent behaviour between development and build

**Root Cause**: When multiple directories match the same alias, TypeScript picks the first match, leading to incorrect resolution.

### 2. Inconsistent Database Import Patterns

**Problem**: Mixed import patterns across the codebase:

**Incorrect Pattern** (causes issues):
```typescript
import { db } from '@/client';
import { patientSessions } from '@/schema';
```

**Correct Pattern** (works reliably):
```typescript
import { db } from '../../../database/client';
import { patientSessions } from '../../../database/schema';
```

**Files Affected in RAG Branch**:
- `src/lib/services/guest-session-service.ts`
- `src/lib/rbac-enforcer.ts` 
- `app/api/patient-sessions/route.ts`
- `app/api/mobile/generate-token/route.ts`
- `app/api/ably/token/route.ts`

### 3. Empty Schema Files

**Problem**: Empty schema files being exported from index
**Example**: `database/schema/guest_sessions.ts` (0 bytes)
**Impact**: TypeScript compilation errors when trying to import from empty modules

## Systematic Debugging Strategy

### Step 1: Categorise Error Types
- **Import path resolution errors** [most common]
- **Missing schema exports** [frequent]
- **Empty file references** [occasional]
- **Build cache issues** [rare]

### Step 2: Identify Root Cause
1. Check for ambiguous path aliases in `tsconfig.json`
2. Search for files using `@/client` and `@/schema` patterns
3. Verify all schema files exist and export content
4. Compare with working files for consistent patterns

### Step 3: Apply Systematic Fix
1. **Use relative paths** for database imports (matches working patterns)
2. **Remove empty schema files** 
3. **Update schema index** to only export existing files
4. **Test one file at a time** to avoid cascading issues

## Prevention Guidelines

### Database Import Standards
```typescript
// ✅ ALWAYS use relative paths for database
import { db } from '../../../database/client';
import { schemaTable } from '../../../database/schema';

// ❌ AVOID path aliases for database  
import { db } from '@/client';
import { schemaTable } from '@/schema';
```

### Path Alias Usage
```typescript
// ✅ USE path aliases for application code
import { ComponentName } from '@/shared/components/ComponentName';
import { utilFunction } from '@/lib/utils';

// ✅ USE relative paths for database
import { db } from '../../database/client';
```

### Schema File Management
1. **Never commit empty schema files**
2. **Always export from schema index after adding new files**
3. **Use consistent naming**: `snake_case` for files, `camelCase` for exports

## Quick Fix Commands

### Find problematic imports:
```bash
grep -r "@/client\|@/schema" --include="*.ts" --include="*.tsx" .
```

### Find empty schema files:
```bash
find database/schema -name "*.ts" -size 0
```

### Check schema exports:
```bash
cat database/schema/index.ts
```

## Lessons Learned

1. **Path aliases should be single-purpose** - avoid mapping one alias to multiple directories
2. **Database imports should always use relative paths** - more predictable resolution
3. **Empty files cause import issues** - clean up incomplete implementations
4. **Follow existing patterns** - consistency prevents resolution conflicts

## Future Prevention

- Add ESLint rule to enforce database import patterns
- Use git pre-commit hooks to check for empty schema files
- Document import standards in contributing guidelines
- Consider refactoring `@/*` to be more specific (e.g., `@/app/*`, `@/src/*`)

## Related Issues

- RAG feature implementation (feature/rag branch)
- TypeScript compilation errors
- Module resolution conflicts
- Build process failures

---

**Last Updated**: January 2025  
**Next Review**: After major feature implementations 