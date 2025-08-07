# Desktop-Mobile Sync STT System

## Overview

The Desktop-Mobile Sync STT (Speech-to-Text) system enables real-time transcription sharing between desktop and mobile devices using Ably real-time messaging with session fallback for resilience. Designed as an MVP with simplified architecture focusing on core transcription functionality.

## Architecture

### Core Components

1. **Desktop (Consultation Page)**
   - Receives transcripts from mobile devices
   - Manages patient sessions
   - Sends session updates to mobile devices
   - Displays simple connection status (connected/disconnected)

2. **Mobile (Mobile Page)**
   - Records audio and sends transcripts to desktop
   - Receives session updates from desktop (real-time)
   - Falls back to polling for session updates when disconnected
   - Handles wake lock during recording
   - Shows fallback mode indicator when Ably disconnected

3. **Ably Integration (useSimpleAbly hook)**
   - Single channel communication using token-based channels
   - Real-time message passing between devices
   - Automatic fallback to session polling when disconnected
   - Simplified without complex device management

### Message Types

- `transcription`: Audio transcript from mobile to desktop
- `patient_updated`: Session info from desktop to mobile

### Token-Based Security

- Mobile devices connect using secure tokens
- Tokens are validated server-side via `/api/ably/simple-token`
- Each token creates a unique channel: `token:${tokenId}`

## Data Flow

### Primary Flow (Ably Connected)
1. Desktop generates mobile token via QR code
2. Mobile scans QR and connects to Ably channel
3. Desktop sends patient session updates to mobile
4. Mobile records audio → Deepgram transcription → sends to desktop
5. Desktop receives and displays transcripts in real-time

### Fallback Flow (Ably Disconnected)
1. Mobile detects Ably disconnection
2. Mobile polls `/api/mobile/current-session?token={tokenId}` every 15 seconds
3. Mobile continues recording with last known session
4. Mobile can manually refresh session info
5. When Ably reconnects, real-time sync resumes

## Key Features

- **Real-time sync**: Instant transcript delivery when connected
- **Session management**: Patient context shared between devices
- **Wake lock**: Prevents mobile screen sleep during recording
- **Simple connection status**: Basic connected/disconnected indicators
- **Session fallback**: Polling-based session sync when Ably disconnected
- **Graceful degradation**: Mobile continues working during network issues
- **MVP simplicity**: Focused on core transcription without device management overhead

## Implementation Details

### useSimpleAbly Hook

Manages Ably connection with stable callbacks and automatic fallback:
- Single channel approach using token-based routing
- Simplified message types: `transcription` and `patient_updated` only
- Automatic session polling when disconnected (15s intervals)
- Throttled API requests (10s minimum between calls)
- No complex device management or health checks

### Mobile Recording

- Uses `useTranscription` hook for audio capture
- 5-second silence threshold for mobile chunks
- Automatic transcription via Deepgram API
- Real-time transmission to desktop
- Fallback session polling during disconnection

### Desktop Integration

- Integrates with consultation stores via `useConsultationStores()` hook
- Session synchronization with mobile devices
- Simple connection status indicators (no device counts)
- All transcript processing functions properly imported
- Removed device management complexity for MVP focus

### Session Fallback API

**Endpoint**: `GET /api/mobile/current-session?token={tokenId}`

**Response**:
```json
{
  "sessionId": "session_123",
  "patientName": "John Doe",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

**Features**:
- Token-based authentication using drizzle ORM
- Returns most recent patient session
- Handles expired/invalid tokens with proper error responses
- Lightweight for frequent polling
- TypeScript strict null safety compliance
- Proper database query optimization

## Resilience Features

### Network Interruption Handling
- **Detection**: Ably connection monitoring
- **Fallback**: HTTP polling every 15 seconds
- **Recovery**: Automatic reconnection when network restored
- **User Feedback**: Visual indicators for connection state

// TODO: Implement smart polling back-off strategy
// - Start with 15s polling interval when Ably is disconnected
// - Gradually increase interval (e.g. 15s → 30s → 60s) if no session changes detected
// - Reset to 15s if:
//     a) Token changes
//     b) App regains focus
//     c) Manual session refresh triggered
// - Use a `lastFetchedAt` timestamp to avoid redundant fetches
// - Goal: reduce backend/API load, battery usage, and cost during prolonged disconnection


### Session Continuity
- Mobile maintains last known session during disconnection
- Continues recording with cached patient information
- Syncs session changes when connection restored
- Manual refresh option for immediate updates

## Security Considerations

- Token-based access control
- Server-side token validation using drizzle ORM
- Channel isolation per token
- Secure WebSocket connections via Ably
- Session data validation on fallback API
- Rate limiting on polling endpoints
- No sensitive device information tracking

## MVP Design Decisions

### Removed Complexity
- **Device Management**: No device tracking, connection counts, or force disconnect
- **Health Checks**: Removed legacy health check endpoints and monitoring
- **Multi-device Support**: Simplified to single mobile-desktop pairing
- **Complex Status**: Removed detailed device status in favor of simple indicators

### Retained Core Features
- **Real-time Transcription**: Mobile to desktop transcript sync
- **Session Continuity**: Patient session sharing between devices
- **Fallback Resilience**: HTTP polling when Ably disconnected
- **Wake Lock**: Screen sleep prevention during recording
- **Token Security**: Secure channel access control

This simplified architecture ensures reliable core functionality while reducing maintenance overhead and potential failure points.

## Critical Fixes Applied (2024)

### Original Deployment Issues (Resolved)

#### Database Query Fix
- **Issue**: `/api/mobile/current-session` used wrong database field reference
- **Fixed**: Changed `eq(mobileTokens.id, tokenId)` → `eq(mobileTokens.token, tokenId)`
- **Impact**: Eliminates 401 errors on session polling

#### Guest Token Support
- **Issue**: Session fallback API didn't support guest users (null userId)
- **Fixed**: Added conditional query logic for guest vs authenticated users
- **Impact**: Guest sessions now work with mobile recording

#### Ably Configuration Fix
- **Issue**: Static token initialization without proper refresh mechanism
- **Fixed**: Implemented `authCallback` configuration with automatic token refresh
- **Impact**: Eliminates "no application id found" and token renewal warnings

#### Token Lifecycle Management
- **Issue**: Premature polling and validation causing cascade failures
- **Fixed**: Added validation guards and conditional hook initialization
- **Impact**: No more 401 errors on page load or before QR generation

#### Mobile Token Validation
- **Issue**: Superficial setTimeout-based validation
- **Fixed**: Proper server-side validation via `/api/ably/simple-token`
- **Impact**: Reliable mobile connection establishment

### Systematic Production Fixes (January 2025)

#### React Closure Staleness Fix
- **Issue**: Desktop session broadcasting used stale `currentPatientSessionId` from React closures
- **Root Cause**: Multiple rapid state changes caused useEffect to capture intermediate/stale values
- **Fixed**: Use fresh `session.id` from `getCurrentPatientSession()` instead of closure-captured ID
- **Impact**: Mobile now receives correct current session ID immediately
- **Code Change**: `updateSession(session.id, session.patientName)` vs `updateSession(currentPatientSessionId, session.patientName)`

#### Desktop Self-Messaging Prevention
- **Issue**: Desktop received its own Ably broadcasts, logging "Session changed on desktop (unexpected)"
- **Root Cause**: Desktop and mobile used same Ably channel without device differentiation
- **Fixed**: Added `isMobile` parameter to `useSimpleAbly` hook with device-specific message filtering
- **Impact**: Desktop no longer processes `patient_updated` messages meant for mobile
- **Code Change**: Desktop (`isMobile: false`) skips session updates, Mobile (`isMobile: true`) processes them

#### FormData Content-Type Fix
- **Issue**: Mobile transcription API calls failed with 500 error "Content-Type was not multipart/form-data"
- **Root Cause**: `createAuthHeadersWithGuest()` set `Content-Type: application/json` which conflicted with FormData body
- **Fixed**: Created `createAuthHeadersForFormData()` function that excludes Content-Type header
- **Impact**: Browser automatically sets correct `multipart/form-data` Content-Type
- **Code Change**: Mobile uses `createAuthHeadersForFormData()` for Deepgram API calls

#### Session Creation Race Condition Fix
- **Issue**: "Session not found in local state" errors when creating new sessions
- **Root Cause**: Ably broadcast triggered before React state update completed
- **Fixed**: Added 100ms delay to `sendPatientUpdatedMessage()` to allow React state to settle
- **Impact**: Eliminates race condition between session creation and broadcast
- **Code Change**: Wrapped Ably send in `setTimeout(() => { ... }, 100)`

#### Guest User Authentication Fix
- **Issue**: 401 errors on `/api/patient-sessions` for anonymous users
- **Root Cause**: API required `x-user-id` header even for guest users with valid tokens
- **Fixed**: Updated patient-sessions API to use RBAC context instead of direct header checks
- **Impact**: Guest users can now create, read, update, and delete their sessions
- **Code Change**: Use `extractRBACContext(req)` to get `{userId, guestToken}` and handle both auth types

### Architecture Improvements

#### Device Type Detection
- Added `isMobile` parameter to Ably hook for proper message routing
- Desktop filters out its own session broadcasts
- Mobile processes session updates from desktop

#### Content-Type Management
- Separated auth header functions for JSON vs FormData requests
- Prevents browser Content-Type conflicts with multipart uploads
- Maintains authentication while allowing proper MIME types

#### Session State Management
- Fixed React closure capture issues in rapid state changes
- Added delays to prevent race conditions
- Improved session synchronization between localStorage and database

#### Guest User Support
- Full RBAC integration for anonymous users
- Proper session ownership validation
- Support for guest tokens in all CRUD operations

## Deployment Testing Checklist

### Critical Path Tests (Original Issues)
1. **Desktop Page Load**
   - ✅ No 401 errors in console on `/consultation` load
   - ✅ No premature API calls before QR generation

2. **QR Code Generation**
   - ✅ Token created and stored successfully
   - ✅ Mobile V2 enabled only after successful generation
   - ✅ No Ably connection attempts before QR creation

3. **Mobile Token Validation**
   - ✅ Proper server-side validation on mobile page load
   - ✅ Clear error messages for expired/invalid tokens
   - ✅ useSimpleAbly only initializes after validation

4. **Ably Connection**
   - ✅ No "no application id found" errors
   - ✅ No token renewal warnings
   - ✅ Proper authCallback-based token refresh

5. **Session Fallback**
   - ✅ Database queries find tokens correctly
   - ✅ Guest users can access sessions
   - ✅ Graceful 401 handling for expired tokens

6. **Guest User Flow**
   - ✅ Anonymous users can create mobile tokens
   - ✅ Guest sessions sync properly with mobile
   - ✅ Session polling works for guest tokens

### Production Fixes Validation (January 2025)

#### Session Management Tests
7. **Session Creation Flow**
   - ✅ No "Session not found in local state" errors during creation
   - ✅ Mobile receives correct session ID immediately after QR generation
   - ✅ No multiple session broadcasts on QR generation
   - ✅ Session switching updates mobile correctly

8. **Desktop Self-Messaging**
   - ✅ No "Session changed on desktop (unexpected)" console messages
   - ✅ Desktop doesn't process its own Ably broadcasts
   - ✅ Only mobile receives session update messages

#### Authentication & API Tests
9. **Guest User Authentication**
   - ✅ Anonymous users can create sessions without 401 errors
   - ✅ Guest tokens work with patient-sessions API (GET/POST/PUT/DELETE)
   - ✅ RBAC context properly handles both userId and guestToken

10. **Mobile Recording API**
    - ✅ No 500 errors on `/api/deepgram/transcribe` with FormData
    - ✅ Proper Content-Type handling (multipart/form-data)
    - ✅ Auth headers work without Content-Type conflicts
    - ✅ Mobile recording succeeds with guest tokens

#### State Management Tests
11. **React State Synchronization**
    - ✅ Session broadcasts use fresh session data, not stale closures
    - ✅ Rapid session switching doesn't cause race conditions
    - ✅ localStorage and database state remain synchronized

12. **Network Resilience**
    - ✅ Ably disconnection triggers fallback polling
    - ✅ Mobile session polling works during network issues
    - ✅ Session continuity maintained during reconnection

### Error Monitoring
- ✅ No 401 errors on session endpoints
- ✅ No 500 errors on transcription endpoints
- ✅ No React closure staleness warnings
- ✅ No Ably self-messaging loops
- ✅ No Content-Type conflicts with FormData
- ✅ Guest user sessions work end-to-end

### Performance Metrics
- Session creation latency < 500ms
- Mobile session sync latency < 200ms
- Ably connection establishment < 2s
- Fallback polling efficiency (15s intervals)
- No memory leaks from stale closures
