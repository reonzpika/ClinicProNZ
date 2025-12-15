# Clinical Images - Detailed Implementation Plan

**Date**: 2025-12-15  
**Phase**: Phase 1B & 1C (Backend + Frontend)  
**Estimated Time**: 6-8 hours total  
**Prerequisites**: Setup instructions completed (SETUP_INSTRUCTIONS.md)

---

## Implementation Overview

Once you complete the S3/Redis setup, I'll implement:

### **Phase 1B: Backend (3-4 hours)**
- Redis session manager utilities
- 6 new API endpoints for session management
- S3 presigned URL generation
- FHIR Media resource builder (already mostly done)

### **Phase 1C: Frontend (3-4 hours)**
- Simple mobile page (4 screens)
- Desktop Ably listener
- Real-time image sync

---

## Phase 1B: Backend Implementation

### Files I'll Create/Modify

```
/src/lib/services/redis/
  ├── redis-client.ts          (NEW) - Upstash Redis connection
  └── session-manager.ts       (NEW) - Session CRUD operations

/app/api/(integration)/medtech/session/
  ├── tokens/route.ts          (NEW) - POST: Create QR session token
  ├── tokens/[token]/route.ts  (NEW) - GET: Validate token
  ├── presigned-url/route.ts   (NEW) - POST: Generate S3 upload URL
  ├── images/route.ts          (NEW) - POST: Add image to session
  ├── [sessionId]/route.ts     (NEW) - GET: Fetch session state
  └── commit/route.ts          (NEW) - POST: Commit to ALEX API

/src/medtech/images-widget/types/
  └── session.ts               (NEW) - Session type definitions
```

---

### 1. Redis Client & Session Manager

**File: `/src/lib/services/redis/redis-client.ts`**

```typescript
import { Redis } from '@upstash/redis';

// Lazy initialization (only when needed)
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Redis credentials not configured');
    }

    redisClient = new Redis({
      url,
      token,
    });
  }

  return redisClient;
}
```

**Purpose**: Single Redis connection instance for all API routes

---

**File: `/src/lib/services/redis/session-manager.ts`**

```typescript
import { getRedisClient } from './redis-client';

// Session data structure (matches implementation-documentation.md)
export interface SessionImage {
  id: string;
  s3Key: string;
  s3Url: string;
  uploaded: boolean;
  source: 'desktop' | 'mobile';
  capturedAt: string;
  metadata: {
    bodySite?: string;
    laterality?: 'left' | 'right' | 'n/a';
    viewType?: string;
    notes?: string;
  };
}

export interface Session {
  patientId: string;
  encounterId: string;
  images: SessionImage[];
  commitStatus: 'none' | 'in_progress' | 'committed';
  createdAt: string;
  lastActivity: string;
}

export interface SessionToken {
  userId: string;
  patientId: string;
  encounterId: string;
  createdAt: string;
}

const SESSION_TTL = 7200; // 2 hours
const TOKEN_TTL = 3600; // 1 hour
const MAX_IMAGES = 20; // Image limit per session

export class SessionManager {
  private redis = getRedisClient();

  /**
   * Create session token (for QR code)
   */
  async createToken(
    token: string,
    userId: string,
    patientId: string,
    encounterId: string,
  ): Promise<void> {
    const sessionToken: SessionToken = {
      userId,
      patientId,
      encounterId,
      createdAt: new Date().toISOString(),
    };

    await this.redis.set(
      `session-token:${token}`,
      JSON.stringify(sessionToken),
      { ex: TOKEN_TTL },
    );
  }

  /**
   * Validate session token
   */
  async getToken(token: string): Promise<SessionToken | null> {
    const data = await this.redis.get(`session-token:${token}`);
    return data ? (data as SessionToken) : null;
  }

  /**
   * Initialize user session
   */
  async initializeSession(
    userId: string,
    patientId: string,
    encounterId: string,
  ): Promise<Session> {
    const session: Session = {
      patientId,
      encounterId,
      images: [],
      commitStatus: 'none',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    await this.redis.set(
      `user:${userId}`,
      JSON.stringify(session),
      { ex: SESSION_TTL },
    );

    return session;
  }

  /**
   * Get user session
   */
  async getSession(userId: string): Promise<Session | null> {
    const data = await this.redis.get(`user:${userId}`);
    if (!data) return null;

    // Update lastActivity and reset TTL
    const session = data as Session;
    session.lastActivity = new Date().toISOString();
    await this.redis.set(
      `user:${userId}`,
      JSON.stringify(session),
      { ex: SESSION_TTL },
    );

    return session;
  }

  /**
   * Add image to session
   */
  async addImage(
    userId: string,
    image: SessionImage,
  ): Promise<Session> {
    const session = await this.getSession(userId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check image limit
    if (session.images.length >= MAX_IMAGES) {
      throw new Error(`Maximum ${MAX_IMAGES} images per session`);
    }

    session.images.push(image);
    session.lastActivity = new Date().toISOString();

    await this.redis.set(
      `user:${userId}`,
      JSON.stringify(session),
      { ex: SESSION_TTL },
    );

    return session;
  }

  /**
   * Update session commit status
   */
  async setCommitStatus(
    userId: string,
    status: Session['commitStatus'],
  ): Promise<void> {
    const session = await this.getSession(userId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.commitStatus = status;
    session.lastActivity = new Date().toISOString();

    await this.redis.set(
      `user:${userId}`,
      JSON.stringify(session),
      { ex: SESSION_TTL },
    );
  }

  /**
   * Delete session (after successful commit)
   */
  async deleteSession(userId: string): Promise<void> {
    await this.redis.del(`user:${userId}`);
  }
}

export const sessionManager = new SessionManager();
```

**Purpose**: CRUD operations for Redis session storage

---

### 2. API Endpoints

**File: `/app/api/(integration)/medtech/session/tokens/route.ts`**

```typescript
/**
 * POST /api/medtech/session/tokens
 * 
 * Create session token for QR code
 */
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { sessionManager } from '@/src/lib/services/redis/session-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, encounterId } = body;

    if (!patientId || !encounterId) {
      return NextResponse.json(
        { error: 'patientId and encounterId required' },
        { status: 400 },
      );
    }

    // Generate session token
    const sessionToken = randomUUID();
    const userId = 'user_' + randomUUID(); // TODO: Get from auth context

    // Store token in Redis
    await sessionManager.createToken(
      sessionToken,
      userId,
      patientId,
      encounterId,
    );

    // Initialize session
    await sessionManager.initializeSession(userId, patientId, encounterId);

    // Generate QR code URL
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/medtech-images/mobile?token=${sessionToken}`;

    return NextResponse.json({
      sessionToken,
      userId,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      qrCodeUrl,
    });
  } catch (error) {
    console.error('Create token error:', error);
    return NextResponse.json(
      { error: 'Failed to create session token' },
      { status: 500 },
    );
  }
}
```

**Purpose**: Desktop generates QR code → Mobile scans → Validates token

---

**File: `/app/api/(integration)/medtech/session/tokens/[token]/route.ts`**

```typescript
/**
 * GET /api/medtech/session/tokens/:token
 * 
 * Validate session token (mobile page)
 */
import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/src/lib/services/redis/session-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const token = params.token;

    const sessionToken = await sessionManager.getToken(token);

    if (!sessionToken) {
      return NextResponse.json(
        { valid: false, error: 'Session token expired or invalid' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      userId: sessionToken.userId,
      patientId: sessionToken.patientId,
      encounterId: sessionToken.encounterId,
      valid: true,
    });
  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 },
    );
  }
}
```

**Purpose**: Mobile validates QR token and gets session context

---

**File: `/app/api/(integration)/medtech/session/presigned-url/route.ts`**

```typescript
/**
 * POST /api/medtech/session/presigned-url
 * 
 * Generate S3 presigned URL for image upload
 */
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'ap-southeast-2' 
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fileName, contentType } = body;

    if (!userId || !fileName || !contentType) {
      return NextResponse.json(
        { error: 'userId, fileName, contentType required' },
        { status: 400 },
      );
    }

    // Generate unique S3 key
    const imageId = randomUUID();
    const ext = fileName.split('.').pop() || 'jpg';
    const s3Key = `temp/${userId}/${imageId}.${ext}`;

    // Generate presigned URL (1-hour expiry)
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600 
    });

    return NextResponse.json({
      uploadUrl,
      s3Key,
      imageId,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 },
    );
  }
}
```

**Purpose**: Mobile/desktop gets secure URL to upload directly to S3

---

**File: `/app/api/(integration)/medtech/session/images/route.ts`**

```typescript
/**
 * POST /api/medtech/session/images
 * 
 * Add uploaded image to session
 */
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { sessionManager } from '@/src/lib/services/redis/session-manager';

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'ap-southeast-2' 
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, imageId, s3Key, source, metadata = {} } = body;

    if (!userId || !imageId || !s3Key || !source) {
      return NextResponse.json(
        { error: 'userId, imageId, s3Key, source required' },
        { status: 400 },
      );
    }

    // Generate presigned URL for retrieval (1-hour expiry)
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: s3Key,
    });

    const s3Url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Add to session
    const session = await sessionManager.addImage(userId, {
      id: imageId,
      s3Key,
      s3Url,
      uploaded: true,
      source,
      capturedAt: new Date().toISOString(),
      metadata,
    });

    return NextResponse.json({
      success: true,
      imageId,
      session,
    });
  } catch (error) {
    console.error('Add image error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
```

**Purpose**: After S3 upload, add image metadata to Redis session

---

**File: `/app/api/(integration)/medtech/session/[sessionId]/route.ts`**

```typescript
/**
 * GET /api/medtech/session/:sessionId
 * 
 * Fetch current session state (for desktop on page load)
 */
import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/src/lib/services/redis/session-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  try {
    const userId = params.sessionId; // sessionId = userId in our case

    const session = await sessionManager.getSession(userId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 },
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 },
    );
  }
}
```

**Purpose**: Desktop fetches session on page load (recovery if Ably fails)

---

**File: `/app/api/(integration)/medtech/session/commit/route.ts`**

```typescript
/**
 * POST /api/medtech/session/commit
 * 
 * Commit all images to ALEX API
 */
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { sessionManager } from '@/src/lib/services/redis/session-manager';
import { alexApiClient } from '@/src/lib/services/medtech';

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'ap-southeast-2' 
});

async function uploadImageToALEX(
  image: any,
  session: any,
): Promise<string> {
  // 1. Download image from S3
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: image.s3Key,
  });

  const response = await s3Client.send(command);
  const imageBuffer = await streamToBuffer(response.Body);
  const base64Image = imageBuffer.toString('base64');

  // 2. Create FHIR Media resource
  const mediaResource = {
    resourceType: 'Media',
    identifier: [{
      system: 'https://clinicpro.co.nz/image-id',
      value: image.id,
    }],
    status: 'completed',
    type: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/media-type',
        code: 'image',
        display: 'Image',
      }],
    },
    subject: {
      reference: `Patient/${session.patientId}`,
    },
    createdDateTime: image.capturedAt,
    content: {
      contentType: 'image/jpeg',
      data: base64Image,
    },
  };

  // 3. POST to ALEX API
  const result = await alexApiClient.post('/Media', mediaResource);
  return result.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 },
      );
    }

    // Get session
    const session = await sessionManager.getSession(userId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 },
      );
    }

    // Check status
    if (session.commitStatus === 'committed') {
      return NextResponse.json(
        { error: 'Session already committed' },
        { status: 409 },
      );
    }

    // Mark in progress
    await sessionManager.setCommitStatus(userId, 'in_progress');

    // Upload each image
    const mediaResourceIds: string[] = [];

    for (const image of session.images) {
      const mediaId = await uploadImageToALEX(image, session);
      mediaResourceIds.push(mediaId);
    }

    // Delete session after success
    await sessionManager.deleteSession(userId);

    return NextResponse.json({
      success: true,
      mediaResourceIds,
      message: `${mediaResourceIds.length} images committed successfully`,
      imageCount: mediaResourceIds.length,
    });
  } catch (error) {
    console.error('Commit error:', error);
    return NextResponse.json(
      { error: 'Commit failed' },
      { status: 500 },
    );
  }
}

// Helper function
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
```

**Purpose**: Upload all images from S3 to ALEX API as FHIR Media resources

---

## Phase 1C: Frontend Implementation

### Simple Mobile Flow (4 Screens)

**Screens to implement:**
1. **Landing** - Validate token, show patient
2. **Camera** - Native camera (no custom UI needed)
3. **Upload Progress** - "Uploading 1 of 3..."
4. **Success** - "Images uploaded for desktop review"

**Skip for now** (add in Phase 2):
- Single image review (Screen 3A)
- Review grid with metadata (Screen 3)
- Individual metadata editing (Screen 4)

---

**File: `/app/(medtech)/medtech-images/mobile/page.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import Ably from 'ably';

// Screen components
function LandingScreen({ session, onCapture }) { /* ... */ }
function UploadProgress({ current, total }) { /* ... */ }
function SuccessScreen({ count }) { /* ... */ }
function ErrorScreen({ error }) { /* ... */ }

export default function MobilePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [screen, setScreen] = useState('loading'); // loading, landing, uploading, success, error
  const [session, setSession] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [ably, setAbly] = useState(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('No session token provided');
      setScreen('error');
      return;
    }

    validateToken(token);
  }, [token]);

  async function validateToken(token: string) {
    try {
      const res = await fetch(`/api/medtech/session/tokens/${token}`);
      const data = await res.json();

      if (!data.valid) {
        setError('Session expired. Please scan QR code again.');
        setScreen('error');
        return;
      }

      setSession(data);
      setScreen('landing');

      // Initialize Ably
      const ablyClient = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY!);
      setAbly(ablyClient);
    } catch (err) {
      setError('Failed to validate session');
      setScreen('error');
    }
  }

  async function handleCapture(files: File[]) {
    setScreen('uploading');
    setUploadProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        // Compress
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        // Get presigned URL
        const presignedRes = await fetch('/api/medtech/session/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.userId,
            fileName: file.name,
            contentType: 'image/jpeg',
          }),
        });
        const { uploadUrl, s3Key, imageId } = await presignedRes.json();

        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: compressed,
          headers: { 'Content-Type': 'image/jpeg' },
        });

        // Add to session
        await fetch('/api/medtech/session/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.userId,
            imageId,
            s3Key,
            source: 'mobile',
            metadata: {},
          }),
        });

        // Notify desktop via Ably
        const channel = ably.channels.get(`session:${session.userId}`);
        await channel.publish('image-uploaded', {
          imageId,
          s3Key,
          source: 'mobile',
          sequenceNumber: i + 1,
        });
      }

      setScreen('success');
    } catch (err) {
      setError('Upload failed');
      setScreen('error');
    }
  }

  // Render screens
  if (screen === 'loading') return <div>Loading...</div>;
  if (screen === 'error') return <ErrorScreen error={error} />;
  if (screen === 'landing') return <LandingScreen session={session} onCapture={handleCapture} />;
  if (screen === 'uploading') return <UploadProgress {...uploadProgress} />;
  if (screen === 'success') return <SuccessScreen count={uploadProgress.total} />;

  return null;
}
```

**Purpose**: Simple mobile flow → Camera → Upload → Done

---

### Desktop Ably Listener

**File: `/src/medtech/images-widget/hooks/useRealtimeSync.ts`**

```typescript
import { useEffect } from 'react';
import Ably from 'ably';
import { useImageWidgetStore } from '../stores/imageWidgetStore';

export function useRealtimeSync(userId: string | null) {
  const { addImage, setError } = useImageWidgetStore();

  useEffect(() => {
    if (!userId) return;

    const ably = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY!);
    const channel = ably.channels.get(`session:${userId}`);

    channel.subscribe('image-uploaded', async (message) => {
      const { imageId, s3Key, source, sequenceNumber } = message.data;

      try {
        // Fetch session to get S3 URL
        const res = await fetch(`/api/medtech/session/${userId}`);
        const session = await res.json();

        const image = session.images.find((img: any) => img.id === imageId);
        if (!image) return;

        // Add to store
        addImage({
          id: imageId,
          file: null,
          preview: image.s3Url,
          thumbnail: image.s3Url,
          status: 'pending',
          metadata: image.metadata,
          source: 'mobile',
          sequenceNumber,
        });
      } catch (error) {
        setError('Failed to sync image from mobile');
      }
    });

    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [userId]);
}
```

**Purpose**: Desktop listens for mobile uploads → Updates UI automatically

---

## Testing Plan

### Manual Test Checklist

After implementation, test these flows:

**Flow 1: Simple Mobile → Desktop**
1. Open desktop widget
2. Click "Show QR"
3. Scan QR with mobile
4. Mobile: Tap camera, take photo
5. Mobile: See upload progress
6. Desktop: See image appear in thumbnail strip (no page refresh)
7. Desktop: Click "Commit All"
8. Verify image in Medtech (check daily record)

**Flow 2: Session Recovery**
1. Mobile uploads 3 images
2. Close desktop page
3. Reopen desktop page
4. Should load 3 images from Redis
5. Commit works

**Flow 3: Error Handling**
1. Mobile uploads with no network
2. Should show retry
3. Desktop offline: Manual refresh button works

---

## Dependencies to Install

```bash
# Already have (existing)
npm install ably

# New dependencies
npm install browser-image-compression
npm install @upstash/redis
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## Environment Variables Needed

**Already in Vercel (from setup):**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`

**Also needed:**
- `NEXT_PUBLIC_ABLY_KEY` (you said already set up)
- `NEXT_PUBLIC_APP_URL` (e.g., `https://app.clinicpro.co.nz`)

---

## Timeline

| Task | Estimated Time |
|------|----------------|
| Redis session manager | 1 hour |
| 6 API endpoints | 2-3 hours |
| Simple mobile page | 2 hours |
| Desktop Ably listener | 1 hour |
| Testing & bug fixes | 1-2 hours |
| **Total** | **7-9 hours** |

---

## After Implementation

**Phase 2 additions** (later):
- Full mobile UI (7 screens with metadata)
- Desktop patient banner
- Metadata form with validation
- Error handling improvements
- Cross-device testing

**Phase 3** (later):
- Widget launch mechanism (requires Medtech partner input)
- Production deployment
- GP pilot testing

---

## Ready to Start?

Once you complete the setup instructions:
1. Reply: "Setup complete!"
2. I'll begin implementing Phase 1B (backend)
3. You can test each endpoint as I build them
4. Then I'll implement Phase 1C (frontend)
5. We'll test end-to-end

**Questions before I start?**

---

**End of Implementation Plan**
