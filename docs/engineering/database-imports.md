# Database Import Guidelines

## Overview
This document outlines the correct way to import database-related modules in the ConsultAI NZ application.

## Import Paths

### Database Client
When importing the database client, use the relative path from your file to the database directory:

```typescript
import { db } from '../../../database/client';
```

### Database Schema
When importing database schemas, use the relative path from your file to the database directory:

```typescript
import { templates } from '../../../database/schema';
```

## Important Notes

1. **Do Not Use Module Aliases**
   - ❌ Avoid using `@/database/client` or `@/database/schema`
   - ✅ Use relative paths (`../../../database/client`)
   - This is because Next.js API routes have issues resolving module aliases

2. **Path Structure**
   - Database files are located at the project root level
   - Navigate up from your file's location using `../` as needed
   - Count the directory levels carefully to ensure correct imports

3. **Common Issues**
   - Module resolution errors in API routes
   - TypeScript errors with incorrect imports
   - Runtime errors when using module aliases

## Example Usage

```typescript
// In app/api/templates/route.ts
import { db } from '../../../database/client';
import { templates } from '../../../database/schema';

export async function GET() {
  try {
    const allTemplates = await db.query.templates.findMany();
    return NextResponse.json(allTemplates);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
```

## Related Documentation
- [Project Structure](./project-structure.md)
- [Database and API Setup](../project/database-api-setup.md)
- [API Specification](./api-specification.md) 