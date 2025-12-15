# Implementation Documentation for Cursor AI Agent

**Project:** Medtech Clinical Images Widget - Phase 1 Mobile Upload & Real-Time Sync

**Target:** Cursor IDE AI Agent with database access

**Goal:** Implement mobile image capture with real-time desktop sync using Ably + Redis architecture

---

## 1. OVERVIEW

### What We're Building
Mobile image capture that syncs in real-time to desktop widget, with Redis persistence and FHIR commit to ALEX API.

### Tech Stack
- **Frontend:** React/Next.js (Vercel)
- **Backend (BFF):** Node.js/Express (Lightsail)
- **Storage:** S3 (images), Redis/Upstash (session state)
- **Real-time:** Ably
- **API:** ALEX FHIR R4

### Architecture Pattern
```
Mobile → S3 + Redis → Ably (with full data) → Desktop → BFF → ALEX API
```

---

## 2. DATABASE SCHEMA

### Redis Keys & Structure

#### Key: `user:{userId}`
**Purpose:** Store active session state for a user  
**TTL:** 7200 seconds (2 hours)

```typescript
interface Session {
  patientId: string;           // Medtech patient ID
  encounterId: string;         // Medtech encounter ID
  images: Image[];             // Array of captured images
  commitStatus: 'none' | 'in_progress' | 'committed';
  createdAt: string;           // ISO timestamp
  lastActivity: string;        // ISO timestamp
}

interface Image {
  id: string;                  // UUID (e.g., "img_a1b2c3d4")
  s3Key: string;               // S3 object key (e.g., "temp/user_abc/img_123.jpg")
  s3Url: string;               // Presigned S3 URL (1-hour expiry)
  uploaded: boolean;           // True when S3 upload confirmed
  source: 'desktop' | 'mobile';
  capturedAt: string;          // ISO timestamp
  metadata: ImageMetadata;
}

interface ImageMetadata {
  bodySite: string;            // SNOMED code (e.g., "left_arm")
  laterality?: 'left' | 'right' | 'bilateral';
  viewType?: 'anterior' | 'posterior' | 'lateral' | 'medial';
  notes?: string;              // Optional clinical notes
}
```

**Example:**
```json
{
  "patientId": "12345",
  "encounterId": "enc_789",
  "images": [
    {
      "id": "img_a1b2c3d4",
      "s3Key": "temp/user_abc123/img_a1b2c3d4.jpg",
      "s3Url": "https://clinicpro-temp.s3.amazonaws.com/...",
      "uploaded": true,
      "source": "mobile",
      "capturedAt": "2025-12-15T10:30:00Z",
      "metadata": {
        "bodySite": "left_arm",
        "laterality": "left",
        "viewType": "anterior"
      }
    }
  ],
  "commitStatus": "none",
  "createdAt": "2025-12-15T10:25:00Z",
  "lastActivity": "2025-12-15T10:30:00Z"
}
```

#### Key: `session-token:{token}`
**Purpose:** Map session token (from QR code) to user/patient context  
**TTL:** 3600 seconds (1 hour)

```typescript
interface SessionToken {
  userId: string;
  patientId: string;
  encounterId: string;
  createdAt: string;
}
```

**Example:**
```json
{
  "userId": "user_abc123",
  "patientId": "12345",
  "encounterId": "enc_789",
  "createdAt": "2025-12-15T10:25:00Z"
}
```

---

## 3. API ENDPOINTS (BFF)

### Base URL: `https://your-bff.lightsail.aws`

---

### 3.1 Create Session Token (for QR Code)

**Endpoint:** `POST /api/session-tokens`

**Purpose:** Generate session token for QR code handoff

**Authentication:** Bearer token (OAuth from Medtech)

**Request:**
```typescript
{
  patientId: string;
  encounterId: string;
}
```

**Response:**
```typescript
{
  sessionToken: string;       // UUID to embed in QR code
  userId: string;             // For client-side use
  expiresAt: string;          // ISO timestamp (1 hour from now)
  qrCodeUrl: string;          // Full mobile URL with params
}
```

**Implementation:**
```typescript
// POST /api/session-tokens
app.post('/api/session-tokens', authenticate, async (req, res) => {
  const { patientId, encounterId } = req.body;
  const userId = req.user.id; // From OAuth token
  
  // Generate session token
  const sessionToken = crypto.randomUUID();
  
  // Store in Redis with 1-hour expiry
  await redis.set(
    `session-token:${sessionToken}`,
    JSON.stringify({
      userId,
      patientId,
      encounterId,
      createdAt: new Date().toISOString()
    }),
    { ex: 3600 }
  );
  
  // Initialize session in Redis with 2-hour expiry
  await redis.set(
    `user:${userId}`,
    JSON.stringify({
      patientId,
      encounterId,
      images: [],
      commitStatus: 'none',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }),
    { ex: 7200 }
  );
  
  const qrCodeUrl = `https://mobile.clinicpro.app?token=${sessionToken}`;
  
  res.json({
    sessionToken,
    userId,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    qrCodeUrl
  });
});
```

---

### 3.2 Validate Session Token

**Endpoint:** `GET /api/session-tokens/:token`

**Purpose:** Mobile page validates token and gets session context

**Authentication:** None (token itself is the auth)

**Response:**
```typescript
{
  userId: string;
  patientId: string;
  encounterId: string;
  valid: boolean;
}
```

**Implementation:**
```typescript
// GET /api/session-tokens/:token
app.get('/api/session-tokens/:token', async (req, res) => {
  const { token } = req.params;
  
  const data = await redis.get(`session-token:${token}`);
  
  if (!data) {
    return res.status(404).json({ 
      valid: false,
      error: 'Session token expired or invalid' 
    });
  }
  
  const session = JSON.parse(data);
  res.json({
    userId: session.userId,
    patientId: session.patientId,
    encounterId: session.encounterId,
    valid: true
  });
});
```

---

### 3.3 Generate S3 Presigned URL

**Endpoint:** `POST /api/users/:userId/presigned-url`

**Purpose:** Get presigned URL for S3 upload

**Authentication:** Session token (from QR) or OAuth token

**Request:**
```typescript
{
  fileName: string;           // Original filename
  contentType: string;        // MIME type (e.g., "image/jpeg")
}
```

**Response:**
```typescript
{
  uploadUrl: string;          // Presigned PUT URL
  s3Key: string;              // S3 object key
  expiresIn: number;          // Seconds until expiry (3600)
}
```

**Implementation:**
```typescript
// POST /api/users/:userId/presigned-url
app.post('/api/users/:userId/presigned-url', authenticate, async (req, res) => {
  const { userId } = req.params;
  const { fileName, contentType } = req.body;
  
  // Generate unique S3 key
  const imageId = crypto.randomUUID();
  const ext = fileName.split('.').pop();
  const s3Key = `temp/${userId}/${imageId}.${ext}`;
  
  // Generate presigned URL (1-hour expiry)
  const s3Client = new S3Client({ region: 'ap-southeast-2' });
  const command = new PutObjectCommand({
    Bucket: 'clinicpro-images-temp',
    Key: s3Key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256'
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  res.json({
    uploadUrl,
    s3Key,
    expiresIn: 3600
  });
});
```

---

### 3.4 Add Image to Session

**Endpoint:** `POST /api/users/:userId/images`

**Purpose:** Record uploaded image in Redis session

**Authentication:** Session token or OAuth token

**Request:**
```typescript
{
  imageId: string;            // UUID
  s3Key: string;              // From presigned URL response
  source: 'desktop' | 'mobile';
  metadata?: {
    bodySite?: string;
    laterality?: string;
    viewType?: string;
    notes?: string;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  imageId: string;
  session: Session;           // Full updated session
}
```

**Implementation:**
```typescript
// POST /api/users/:userId/images
app.post('/api/users/:userId/images', authenticate, async (req, res) => {
  const { userId } = req.params;
  const { imageId, s3Key, source, metadata = {} } = req.body;
  
  // Get current session
  const sessionData = await redis.get(`user:${userId}`);
  if (!sessionData) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const session = JSON.parse(sessionData);
  
  // Check image limit
  if (session.images.length >= 50) {
    return res.status(400).json({ error: 'Maximum 50 images per session' });
  }
  
  // Generate presigned URL for retrieval (1-hour expiry)
  const s3Client = new S3Client({ region: 'ap-southeast-2' });
  const command = new GetObjectCommand({
    Bucket: 'clinicpro-images-temp',
    Key: s3Key
  });
  const s3Url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  // Add image to session
  const newImage = {
    id: imageId,
    s3Key,
    s3Url,
    uploaded: true,
    source,
    capturedAt: new Date().toISOString(),
    metadata
  };
  
  session.images.push(newImage);
  session.lastActivity = new Date().toISOString();
  
  // Update Redis with 2-hour TTL
  await redis.set(`user:${userId}`, JSON.stringify(session), { ex: 7200 });
  
  res.json({
    success: true,
    imageId,
    session
  });
});
```

---

### 3.5 Get Session

**Endpoint:** `GET /api/users/:userId/session`

**Purpose:** Fetch current session state (for desktop on load or manual refresh)

**Authentication:** Session token or OAuth token

**Response:**
```typescript
Session | { error: string }
```

**Implementation:**
```typescript
// GET /api/users/:userId/session
app.get('/api/users/:userId/session', authenticate, async (req, res) => {
  const { userId } = req.params;
  
  const sessionData = await redis.get(`user:${userId}`);
  
  if (!sessionData) {
    return res.status(404).json({ error: 'Session not found or expired' });
  }
  
  const session = JSON.parse(sessionData);
  
  // Update lastActivity
  session.lastActivity = new Date().toISOString();
  await redis.set(`user:${userId}`, JSON.stringify(session), { ex: 7200 });
  
  res.json(session);
});
```

---

### 3.6 Commit Session (to ALEX API)

**Endpoint:** `POST /api/users/:userId/commit`

**Purpose:** Upload all images to ALEX as FHIR Media resources

**Authentication:** Session token or OAuth token

**Request:** (empty body)

**Response:**
```typescript
{
  success: boolean;
  mediaResourceIds: string[];  // ALEX Media resource IDs
  message: string;
  imageCount: number;
}
```

**Implementation:**
```typescript
// POST /api/users/:userId/commit
app.post('/api/users/:userId/commit', authenticate, async (req, res) => {
  const { userId } = req.params;
  
  // Get session
  const sessionData = await redis.get(`user:${userId}`);
  if (!sessionData) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const session = JSON.parse(sessionData);
  
  // Check if already committed
  if (session.commitStatus === 'committed') {
    return res.status(409).json({ 
      error: 'Session already committed',
      success: false
    });
  }
  
  // Check if in progress (prevent double commit)
  if (session.commitStatus === 'in_progress') {
    return res.status(409).json({ 
      error: 'Commit already in progress',
      success: false
    });
  }
  
  // Mark as in progress
  session.commitStatus = 'in_progress';
  await redis.set(`user:${userId}`, JSON.stringify(session), { ex: 7200 });
  
  const mediaResourceIds = [];
  
  try {
    // Upload each image to ALEX (all-or-nothing)
    for (const image of session.images) {
      const mediaId = await uploadImageToALEX(image, session);
      mediaResourceIds.push(mediaId);
    }
    
    // All succeeded - delete session from Redis
    await redis.del(`user:${userId}`);
    
    res.json({
      success: true,
      mediaResourceIds,
      message: `${mediaResourceIds.length} images committed successfully`,
      imageCount: mediaResourceIds.length
    });
    
  } catch (error) {
    // Rollback: Mark as failed
    session.commitStatus = 'none';
    await redis.set(`user:${userId}`, JSON.stringify(session), { ex: 7200 });
    
    res.status(500).json({
      success: false,
      error: `Commit failed: ${error.message}`,
      partialSuccess: false
    });
  }
});

// Helper: Upload single image to ALEX
async function uploadImageToALEX(image, session) {
  // 1. Download image from S3
  const s3Client = new S3Client({ region: 'ap-southeast-2' });
  const command = new GetObjectCommand({
    Bucket: 'clinicpro-images-temp',
    Key: image.s3Key
  });
  
  const s3Response = await s3Client.send(command);
  const imageBuffer = await streamToBuffer(s3Response.Body);
  const base64Image = imageBuffer.toString('base64');
  
  // 2. Create FHIR Media resource
  const mediaResource = {
    resourceType: "Media",
    status: "completed",
    content: {
      contentType: "image/jpeg",
      data: base64Image
    },
    subject: {
      reference: `Patient/${session.patientId}`
    },
    context: {
      reference: `Encounter/${session.encounterId}`
    },
    createdDateTime: image.capturedAt,
    bodySite: image.metadata.bodySite ? {
      coding: [{
        system: "http://snomed.info/sct",
        code: image.metadata.bodySite
      }]
    } : undefined,
    note: image.metadata.notes ? [{
      text: image.metadata.notes
    }] : undefined
  };
  
  // 3. POST to ALEX API
  const alexToken = await getALEXAccessToken(); // OAuth refresh if needed
  
  const response = await fetch('https://alex-api.medtech.com/fhir/Media', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${alexToken}`,
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json'
    },
    body: JSON.stringify(mediaResource)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ALEX API error (${response.status}): ${errorText}`);
  }
  
  const result = await response.json();
  return result.id; // Media resource ID
}
```

---

## 4. FRONTEND IMPLEMENTATION

### 4.1 Mobile Page (`/mobile`)

**File:** `app/mobile/page.tsx`

**Flow:**
1. Parse `?token=` from URL
2. Validate token with BFF
3. Store session context in sessionStorage
4. Show camera capture UI
5. On capture → Compress → Upload to S3 → Add to Redis → Publish to Ably
6. Optional: Show "Commit Now" button

**Key Code:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Ably from 'ably';

export default function MobilePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [session, setSession] = useState(null);
  const [ably, setAbly] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // 1. Validate token and get session context
  useEffect(() => {
    const validateToken = async () => {
      const res = await fetch(`/api/session-tokens/${token}`);
      const data = await res.json();
      
      if (data.valid) {
        setSession(data);
        // Store in sessionStorage for recovery
        sessionStorage.setItem('clinicpro_session', JSON.stringify(data));
        
        // Initialize Ably
        const ablyClient = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY);
        setAbly(ablyClient);
      } else {
        alert('Invalid or expired session token');
      }
    };
    
    if (token) {
      validateToken();
    } else {
      // Try to restore from sessionStorage
      const saved = sessionStorage.getItem('clinicpro_session');
      if (saved) {
        const data = JSON.parse(saved);
        setSession(data);
        
        const ablyClient = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY);
        setAbly(ablyClient);
      }
    }
  }, [token]);
  
  // 2. Handle image capture
  const handleCapture = async (file: File) => {
    if (!session) return;
    
    setUploading(true);
    
    try {
      // Compress image to < 1MB
      const compressed = await compressImage(file);
      
      // Get presigned URL
      const presignedRes = await fetch(`/api/users/${session.userId}/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: 'image/jpeg'
        })
      });
      const { uploadUrl, s3Key } = await presignedRes.json();
      
      // Upload to S3
      await uploadToS3(compressed, uploadUrl);
      
      // Generate image ID
      const imageId = crypto.randomUUID();
      
      // Add to Redis session
      const addRes = await fetch(`/api/users/${session.userId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId,
          s3Key,
          source: 'mobile',
          metadata: {}
        })
      });
      const { session: updatedSession } = await addRes.json();
      
      // Publish to Ably with FULL data
      const channel = ably.channels.get(`session:${session.userId}`);
      const newImage = updatedSession.images.find(img => img.id === imageId);
      
      await channel.publish('image-uploaded', {
        imageId: newImage.id,
        s3Key: newImage.s3Key,
        s3Url: newImage.s3Url,
        metadata: newImage.metadata,
        capturedAt: newImage.capturedAt,
        source: 'mobile'
      });
      
      alert('Image uploaded successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Tap to retry.');
    } finally {
      setUploading(false);
    }
  };
  
  // 3. Optional: Mobile commit
  const handleMobileCommit = async () => {
    if (!session) return;
    
    if (!confirm('Commit all images to Medtech?')) return;
    
    try {
      const res = await fetch(`/api/users/${session.userId}/commit`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (result.success) {
        // Notify desktop via Ably
        const channel = ably.channels.get(`session:${session.userId}`);
        await channel.publish('session-committed', {
          success: true,
          imageCount: result.imageCount
        });
        
        alert(`${result.imageCount} images committed successfully!`);
        sessionStorage.removeItem('clinicpro_session');
      } else {
        alert(`Commit failed: ${result.error}`);
      }
    } catch (error) {
      alert('Commit failed. Please try again.');
    }
  };
  
  if (!session) {
    return <div>Loading session...</div>;
  }
  
  return (
    <div>
      <h1>Capture Clinical Images</h1>
      <p>Patient: {session.patientId}</p>
      
      {/* Camera capture UI */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleCapture(e.target.files[0])}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
      
      <button onClick={handleMobileCommit}>
        Commit Images from Mobile
      </button>
    </div>
  );
}

// Helper: Compress image
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Max width 1920px
        const maxWidth = 1920;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
      };
      img.src = e.target.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Helper: Upload to S3
async function uploadToS3(blob: Blob, presignedUrl: string) {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': 'image/jpeg' }
  });
  
  if (!response.ok) {
    // Retry once after 2 seconds
    await new Promise(r => setTimeout(r, 2000));
    
    const retryResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' }
    });
    
    if (!retryResponse.ok) {
      throw new Error('S3 upload failed');
    }
  }
}
```

---

### 4.2 Desktop Widget

**File:** `app/page.tsx` (or embedded widget)

**Flow:**
1. Initialize Ably connection
2. Subscribe to `session:{userId}` channel
3. Listen for `image-uploaded` events → Update UI directly
4. Listen for `session-committed` events → Clear session
5. On page load: Fetch current session from Redis
6. Manual "Refresh" button if Ably disconnects

**Key Code:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import Ably from 'ably';

export default function DesktopWidget() {
  const userId = 'user_abc123'; // From auth context
  
  const [images, setImages] = useState([]);
  const [ablyConnected, setAblyConnected] = useState(true);
  const [committing, setCommitting] = useState(false);
  
  // 1. Fetch session on page load
  useEffect(() => {
    fetchSession();
  }, [userId]);
  
  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/session`);
      if (res.ok) {
        const session = await res.json();
        setImages(session.images);
      }
    } catch (error) {
      console.log('No active session');
    }
  };
  
  // 2. Initialize Ably
  useEffect(() => {
    const ably = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY);
    const channel = ably.channels.get(`session:${userId}`);
    
    // Listen for new images (with full data)
    channel.subscribe('image-uploaded', (message) => {
      const newImage = message.data;
      setImages(prev => [...prev, newImage]);
      
      // Show toast notification
      console.log(`New image from ${newImage.source}`);
    });
    
    // Listen for mobile commit
    channel.subscribe('session-committed', (message) => {
      alert(`Mobile committed ${message.data.imageCount} images successfully`);
      setImages([]);
    });
    
    // Monitor connection
    ably.connection.on('disconnected', () => {
      setAblyConnected(false);
    });
    
    ably.connection.on('connected', () => {
      setAblyConnected(true);
    });
    
    return () => {
      channel.unsubscribe();
      ably.close();
    };
  }, [userId]);
  
  // 3. Desktop commit
  const handleCommit = async () => {
    if (!confirm(`Commit ${images.length} images to Medtech?`)) return;
    
    setCommitting(true);
    
    try {
      const res = await fetch(`/api/users/${userId}/commit`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (result.success) {
        alert(`${result.imageCount} images committed successfully!`);
        setImages([]);
      } else {
        alert(`Commit failed: ${result.error}`);
      }
    } catch (error) {
      alert('Commit failed. Please try again.');
    } finally {
      setCommitting(false);
    }
  };
  
  return (
    <div>
      <h1>Clinical Images</h1>
      
      {!ablyConnected && (
        <div style={{ background: 'yellow', padding: 10 }}>
          Real-time sync disconnected.
          <button onClick={fetchSession}>Refresh</button>
        </div>
      )}
      
      <div>
        {images.map(img => (
          <div key={img.id}>
            <img src={img.s3Url} alt="Clinical" style={{ width: 200 }} />
            <p>From: {img.source}</p>
            <p>Body site: {img.metadata.bodySite || 'Not specified'}</p>
          </div>
        ))}
      </div>
      
      {images.length > 0 && (
        <button onClick={handleCommit} disabled={committing}>
          {committing ? 'Committing...' : `Commit ${images.length} Images`}
        </button>
      )}
      
      {images.length >= 20 && images.length < 50 && (
        <p style={{ color: 'orange' }}>
          You have {images.length} images. Consider committing this batch.
        </p>
      )}
      
      {images.length >= 50 && (
        <p style={{ color: 'red' }}>
          Maximum 50 images reached. Please commit before adding more.
        </p>
      )}
    </div>
  );
}
```

---

## 5. ABLY CONFIGURATION

### Events & Channels

**Channel naming:** `session:{userId}`

**Events to implement:**

#### Event: `image-uploaded`
**Published by:** Mobile or Desktop after S3 upload + Redis write  
**Payload:**
```typescript
{
  imageId: string;
  s3Key: string;
  s3Url: string;              // Presigned URL for preview
  metadata: ImageMetadata;
  capturedAt: string;
  source: 'mobile' | 'desktop';
}
```

**Subscribed by:** Desktop widget

---

#### Event: `session-committed`
**Published by:** Mobile (if mobile commits directly)  
**Payload:**
```typescript
{
  success: boolean;
  imageCount: number;
}
```

**Subscribed by:** Desktop widget

---

### Ably Client Setup

**Environment Variable:** `NEXT_PUBLIC_ABLY_KEY` (your Ably API key)

**Client initialization:**
```typescript
import Ably from 'ably';

const ably = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_KEY);
const channel = ably.channels.get(`session:${userId}`);
```

---

## 6. S3 CONFIGURATION

### Bucket Setup

**Bucket name:** `clinicpro-images-temp`  
**Region:** `ap-southeast-2` (Sydney)  
**Retention:** 1 hour (lifecycle policy)

**Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::clinicpro-images-temp/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

**Lifecycle Rule:**
```json
{
  "Rules": [
    {
      "Id": "DeleteAfter1Hour",
      "Status": "Enabled",
      "Prefix": "temp/",
      "Expiration": {
        "Days": 1
      }
    }
  ]
}
```
**CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": [
      "https://clinicpro.app",
      "https://mobile.clinicpro.app",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 7. ERROR HANDLING

### S3 Upload Failure
**Symptom:** Fetch to presigned URL fails  
**Action:** Retry once after 2-second delay  
**UI:** Show "Upload failed. Tap to retry."

### Ably Disconnection
**Symptom:** `ably.connection.on('disconnected')`  
**Action:** Show banner: "Real-time sync disconnected"  
**UI:** Display manual "Refresh" button (calls `fetchSession()`)

### Commit Failure
**Symptom:** `/api/users/:userId/commit` returns error  
**Action:** Keep session in Redis (no deletion)  
**UI:** Show error message with "Retry Commit" button

### Session Not Found
**Symptom:** Redis returns null for `user:{userId}`  
**Action:** Return 404 from BFF  
**UI:** Show "Session expired. Please restart capture."

### Image Limit Exceeded
**Symptom:** Session has 50+ images  
**Action:** Block upload, return 400 from BFF  
**UI:** Show "Maximum 50 images reached. Please commit."

---

## 8. TESTING CHECKLIST

### Unit Tests
- [ ] Redis session CRUD operations
- [ ] S3 presigned URL generation
- [ ] FHIR Media resource creation
- [ ] Image compression (< 1MB output)

### Integration Tests
- [ ] Full mobile upload flow (S3 + Redis + Ably)
- [ ] Desktop receives Ably notification
- [ ] Desktop fetches session on page load
- [ ] Commit all-or-nothing transaction
- [ ] Session token validation

### E2E Tests
- [ ] QR code scan → Mobile capture → Desktop preview
- [ ] Mobile commit → Desktop notification
- [ ] Desktop commit → Redis cleanup
- [ ] Session timeout (2 hours)
- [ ] Image limit enforcement (50 max)

### Manual Testing Scenarios
1. **Happy path:** Mobile captures 3 images → Desktop reviews → Desktop commits
2. **Mobile commit:** Mobile captures + commits directly
3. **Desktop joins late:** Mobile uploads images while desktop closed → Desktop opens → Fetches from Redis
4. **Ably failure:** Disconnect Ably → Mobile uploads → Desktop uses manual refresh
5. **Page refresh:** Desktop refreshes mid-session → Session lost (acceptable)
6. **Retry:** S3 upload fails → Retry succeeds

---

## 9. ENVIRONMENT VARIABLES

### Frontend (Vercel)
```bash
NEXT_PUBLIC_ABLY_KEY=your_ably_api_key
NEXT_PUBLIC_BFF_URL=https://your-bff.lightsail.aws
```

### Backend (Lightsail)
```bash
# Redis (Upstash)
REDIS_URL=rediss://default:password@host:port

# S3
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=clinicpro-images-temp

# Ably
ABLY_API_KEY=your_ably_api_key

# ALEX API
ALEX_API_URL=https://alex-api.medtech.com
ALEX_CLIENT_ID=your_client_id
ALEX_CLIENT_SECRET=your_client_secret
ALEX_OAUTH_TOKEN_URL=https://alex-api.medtech.com/oauth/token
```

---

## 10. DEPLOYMENT ORDER

1. **Setup Infrastructure:**
   - [ ] Create S3 bucket with lifecycle policy
   - [ ] Configure Upstash Redis instance
   - [ ] Create Ably account and get API key

2. **Deploy BFF (Lightsail):**
   - [ ] Implement all API endpoints (section 3)
   - [ ] Test Redis connection
   - [ ] Test S3 presigned URL generation
   - [ ] Test ALEX API integration

3. **Deploy Frontend (Vercel):**
   - [ ] Implement mobile page (section 4.1)
   - [ ] Implement desktop widget (section 4.2)
   - [ ] Test Ably connection
   - [ ] Test end-to-end flow

4. **Integration Testing:**
   - [ ] QR code flow
   - [ ] Mobile → Desktop sync
   - [ ] Commit flow
   - [ ] Error handling

---

## 11. SUCCESS CRITERIA

**Phase 1 is complete when:**
- ✅ GP can scan QR code and capture images on mobile
- ✅ Desktop receives images in real-time via Ably
- ✅ Desktop can commit images to ALEX API successfully
- ✅ Mobile can optionally commit directly
- ✅ Sessions persist in Redis for 2 hours
- ✅ Error handling works (retry, manual refresh)
- ✅ Image limit enforcement (50 max)

---

## 12. KNOWN LIMITATIONS (Phase 1)

- Desktop page refresh = lost session (acceptable)
- No automatic polling (manual refresh if Ably fails)
- No Service Worker for background retries
- No partial commit recovery (all-or-nothing)
- Single EMR support (ALEX only)

**These will be addressed in Phase 2.**
