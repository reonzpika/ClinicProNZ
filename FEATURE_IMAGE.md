# Implementation Specification: Image Integration

## 1. Overview
Enable GPs to capture clinical images via a mobile QR-based workflow, upload directly to AWS S3, run AI analysis, and integrate results into the desktop consultation context. Images auto-expire post-session and remain accessible for preview, annotation and download during the active consultation.

---

## 2. Architecture Overview
- **Mobile Client**
  • Single-page app (Next.js) opened via QR code with session token
  • Camera capture & file picker fallback
  • Client-side image resizing (max 1024 px) → JPEG/PNG
  • Direct PUT upload to S3 via presigned URL
  • POST metadata to API server
- **API Server (Next.js App Router + TypeScript)**
  • `GET /api/uploads/presign` → issue S3 presigned PUT URL & object key
  • `POST /api/consultations/{id}/images` → record metadata in DB
  • `GET /api/consultations/{id}/images` → list images + presigned GET URLs
  • `GET /api/consultations/{id}/images/{key}/download` → fresh presigned GET URL
- **AWS S3**
  • Private bucket in NZ-region
  • CORS: mobile domain allowed for PUT/GET
  • Server-side encryption (SSE-S3)
  • Lifecycle rule: delete objects 1 hour after creation
- **AI Analysis (AWS Lambda)**
  • S3 ObjectCreated→Invoke Lambda
  • Lambda fetches image via presigned GET URL, calls OpenAI GPT for clinical description
  • Lambda updates `consultation_images.aiDescription` in Neon DB

---

## 3. Data Models (Drizzle ORM)

```ts
// Session tracking (optional)
export const mobileUploadSessions = pgTable('mobile_upload_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id').notNull()
    .references(() => consultations.id),
  token: varchar('token', { length: 128 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const consultationImages = pgTable('consultation_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id').notNull()
    .references(() => consultations.id),
  key: varchar('key', { length: 255 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 64 }).notNull(),
  aiDescription: text('ai_description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

---

## 4. API Endpoints

### 4.1 GET /api/uploads/presign?session={token}
- Auth: session token or Clerk JWT
- Query: session token
- Response:
  ```json
  {
    "uploadUrl": "https://s3.amazonaws.com/…?X-Amz…",
    "key": "consultations/{consultationId}/{uuid}.jpg"
  }
  ```

### 4.2 POST /api/consultations/{id}/images
- Auth: session token or Clerk JWT
- Path param: consultationId
- Body: `{ "key": string, "filename": string, "mimeType": string }`
- Action: insert into `consultation_images`, return image metadata

### 4.3 GET /api/consultations/{id}/images
- Auth: Clerk JWT
- Response: list of images with presigned GET URLs (1 h expiry) and `aiDescription`

### 4.4 GET /api/consultations/{id}/images/{key}/download
- Auth: Clerk JWT
- Response: `{ "downloadUrl": string }` (presigned GET URL)

---

## 5. AWS Configuration

1. **S3 Bucket**
   - Create in NZ-region, enable private access
   - Set CORS policy for mobile domain PUT/GET
   - Enable SSE-S3 encryption

2. **Lifecycle Rule**
   - Prefix: `consultations/`
   - Expire objects 1 hour after `CreationDate`

3. **IAM Role for Presign**
   - Permissions: `s3:PutObject`, `s3:PutObjectAcl` on bucket prefix
   - Permissions: `s3:GetObject` for presigned GET

4. **Lambda Function**
   - Trigger: S3 `ObjectCreated:Put` on bucket prefix
   - IAM Role:
     • `s3:GetObject` on bucket
     • DB write to Neon via secure credentials
     • Network: allow access to OpenAI API

---

## 6. Client-Side Image Resizing

- On file selection or camera capture:
  1. Draw to `<canvas>` at max 1024 px dimension
  2. Export `canvas.toBlob()` as JPEG/PNG
  3. Upload resized blob to presigned PUT URL

---

## 7. AI Analysis Pipeline

- **Lambda Flow**:
  1. Receive S3 event → extract bucket & key
  2. Generate presigned GET URL (short expiry)
  3. Call OpenAI GPT endpoint with prompt:
     > “Provide a concise clinical description of the skin lesion at URL: {getUrl}.”
  4. Update `consultation_images.aiDescription` via Drizzle ORM

- **Performance**:
  • Limit concurrent executions to control cost
  • Retry on transient errors with back-off

---

## 8. Next Steps & Milestones

- Provision AWS resources (S3 bucket, IAM roles, Lambda env)
- Build and test presign & metadata API routes
- Implement mobile upload page with resizing & direct S3 PUT
- Create Lambda function for AI analysis and DB update
- Integrate desktop UI: list images, show descriptions, enable download
- End-to-end testing in staging, verify auto-expiry behaviour

**IMPORTANT:**
• This document is intended as high-level guidance only.
• The assigned developer/AI agent should review the existing codebase, assess all implementation options in context, and select or adapt the approach that fits best.
• Implement the chosen solution gracefully, ensuring consistency with current architecture, coding standards and project conventions.

**Please ask any clarifying questions before proceeding.**
