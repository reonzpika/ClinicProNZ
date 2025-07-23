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

- Integrates with consultation context via useConsultation hook
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
