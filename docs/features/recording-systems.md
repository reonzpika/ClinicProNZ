# ClinicPro Recording Systems

## Overview

ClinicPro provides dual recording capabilities to support flexible clinical workflows: **Desktop Recording** for traditional consultation setups and **Mobile Recording** for remote or mobile consultation scenarios. Both systems deliver identical transcription quality and data persistence through a unified architecture.

## System Architecture

### Core Components
- **Voice Activity Detection (VAD)**: Intelligent speech pattern detection with natural pause recognition
- **Deepgram Integration**: Professional-grade speech-to-text processing
- **Real-time Synchronisation**: Ably-powered instant communication between devices
- **Direct Database Persistence**: Immediate storage of all transcription chunks
- **Enhanced Transcription Data**: Confidence scores, word-level timing, and paragraph structure

### Data Flow Pipeline
```
Continuous Audio → VAD Speech Detection → Natural Pause Recognition → Chunk Creation → Deepgram API → Enhanced Transcription → Database Storage
```

## Desktop Recording System

### Features
- **Local Audio Processing**: Direct microphone access with real-time volume monitoring
- **Smart VAD Logic**: Natural pause detection with intelligent boundary recognition
- **Immediate Persistence**: Direct database saves for each transcription chunk
- **Session Management**: Automatic association with current patient sessions
- **Quality Monitoring**: Real-time audio level feedback and recording status

### Technical Characteristics
- **VAD-Based Chunking**: Creates chunks after 10 seconds of silence following speech
- **Smart Boundaries**: After 250+ seconds of continuous speech → 2-second micro-pause detection
- **Maximum Duration**: 6-minute absolute limit per chunk
- **Audio Quality**: Professional-grade recording with adjustable gain
- **Error Handling**: Automatic retry mechanisms and graceful degradation

### Workflow Integration
1. GP starts recording during consultation
2. System records continuously with VAD monitoring
3. Creates chunks when natural pauses occur (10+ seconds silence after speech)
4. Immediate transcription and database storage for each chunk
5. Real-time display of transcribed content
6. Manual stop control when consultation ends

## Mobile Recording System

### Features
- **Remote Recording**: Record on mobile device, transcribe on desktop
- **QR Code Authentication**: Secure token-based pairing with desktop
- **Real-time Sync**: Instant transcription delivery via Ably channels
- **Bi-directional Control**: Desktop can remotely start/stop mobile recording
- **Enhanced Data Transfer**: Rich transcription metadata including confidence scores
- **Wake Lock Support**: Prevents screen timeout during recording sessions

### Technical Characteristics
- **Consistent VAD Logic**: Same intelligent pause detection as desktop
- **Token Authentication**: Secure mobile-token based access
- **Network Resilience**: Automatic reconnection and error recovery
- **Data Quality**: Identical Deepgram processing to desktop
- **Status Synchronisation**: Real-time recording status updates

### Mobile Workflow
1. GP generates QR code on desktop
2. Mobile device scans and establishes secure connection
3. Mobile records continuously with VAD-based chunk creation
4. Chunks created on natural speech pauses, transcribed, and sent via Ably
5. Desktop displays and stores transcriptions immediately
6. Bi-directional control allows desktop management of mobile recording

## Data Persistence & Reliability

### Database Architecture
- **Chunk-based Storage**: Each natural speech segment stored as individual database entry
- **Enhanced Metadata**: Confidence scores, word timing, paragraph structure
- **Session Association**: Automatic linking to current patient consultation
- **Real-time Updates**: Immediate UI updates as new chunks arrive
- **Complete History**: Full conversation reconstruction from stored chunks

### Reliability Features
- **Direct Database Saves**: No intermediate caching layers
- **Atomic Operations**: Each transcription chunk saved independently
- **Session Restoration**: Complete conversation reconstruction on session switch
- **Error Recovery**: Graceful handling of network and authentication failures
- **Data Integrity**: Checksums and validation for all transcription data

## Local & Server Database Management

### Dual-Layer Architecture
ClinicPro implements a sophisticated dual-layer data management system that seamlessly coordinates between local state and server persistence to provide optimal performance and reliability.

### Local State Management (Client-Side)
- **Zustand Stores**: Lightweight, reactive state management for real-time UI updates
  - `consultationStore`: Current session data, generated notes, consultation items
  - `transcriptionStore`: Real-time transcription accumulation and display
- **Immediate UI Updates**: Local state updates instantly for responsive user experience
- **Session-Scoped Data**: Local stores automatically clear and reload on session switching
- **Real-time Accumulation**: Transcription chunks append to local state as they arrive

### Server Database (PostgreSQL + Drizzle ORM)
- **Persistent Storage**: All transcription data permanently stored in PostgreSQL
- **Structured Schema**: Patient sessions with JSON arrays for transcription chunks
- **Enhanced Metadata**: Each chunk includes confidence scores, timestamps, and source tracking
- **Atomic Transactions**: Database operations ensure data consistency and integrity

### Data Synchronisation Flow

#### Desktop Recording Flow:
```
1. VAD Detects Pause → 2. Create Audio Chunk → 3. Send to Deepgram API
4. Receive Transcription → 5. Update Local Store → 6. Save to Database
7. UI Updates Immediately
```

#### Mobile Recording Flow:
```
1. Mobile VAD → 2. Audio Chunk → 3. Mobile Deepgram Call → 4. Send via Ably
5. Desktop Receives → 6. Update Local Store → 7. Save to Database → 8. UI Updates
```

#### Session Switching Flow:
```
1. Clear All Local Stores → 2. Load Session from Database → 3. Hydrate Local Stores
4. Reconstruct Full Conversation → 5. Update UI Display
```

### Data Consistency Patterns

#### Write-Through Pattern
- **Local First**: Immediate local state updates for UI responsiveness
- **Database Second**: Automatic background persistence to server
- **No Local Caching**: Local state is transient and reconstructed from database

#### Session Restoration
- **Complete Reconstruction**: Full conversation rebuilt from database chunks
- **Chunk Concatenation**: Individual transcription entries joined into continuous text
- **Metadata Preservation**: Confidence scores and timestamps maintained
- **State Hydration**: All session components (notes, items, images) loaded simultaneously

### Performance Optimisations

#### Local State Efficiency
- **Minimal Memory Footprint**: Only current session data held in local stores
- **Reactive Updates**: UI components automatically re-render on state changes
- **Optimistic Updates**: UI updates immediately, database saves happen asynchronously
- **Automatic Cleanup**: Previous session data automatically cleared on switching

#### Database Efficiency
- **Indexed Queries**: Fast session lookups by user ID and session ID
- **Chunked Storage**: Individual transcription entries for granular access
- **JSON Serialisation**: Complex data structures efficiently stored and retrieved
- **Connection Pooling**: Optimised database connections for concurrent users

### Failure Recovery Mechanisms

#### Local State Recovery
- **Automatic Restoration**: Failed sessions automatically reload from database
- **State Validation**: Local store integrity checked on critical operations
- **Graceful Degradation**: UI remains functional even with partial data loading
- **Real-time Sync**: New chunks continue to arrive and display during recovery

#### Database Recovery
- **Transaction Rollback**: Failed database operations automatically rolled back
- **Retry Logic**: Temporary failures handled with exponential backoff
- **Data Validation**: Server-side validation prevents corrupted data storage
- **Backup Strategies**: Regular database backups ensure data protection

### Mobile-Desktop Data Coordination
- **Single Source of Truth**: Server database maintains authoritative session data
- **Real-time Propagation**: Mobile transcriptions immediately sync to desktop local state
- **Conflict Resolution**: Desktop database saves take precedence over local modifications
- **Session Locking**: Prevents concurrent modification conflicts during active recording

## File Structure & Code Organization

### Desktop Recording System
```
src/features/clinical/main-ui/
├── hooks/
│   └── useTranscription.ts              # Core VAD logic, audio processing, desktop recording
├── components/
│   ├── TranscriptionControls.tsx        # Recording controls UI (start/stop/pause)
│   ├── EnhancedTranscriptionDisplay.tsx # Real-time transcription display (only for admin users)
│   └── TypedInput.tsx                   # Manual text input component

app/(clinical)/consultation/
└── page.tsx                             # Main consultation interface with recording integration
```

### Mobile Recording System
```
app/(integration)/mobile/
└── page.tsx                             # Mobile recording interface and QR pairing

src/features/clinical/mobile/
├── hooks/
│   └── useSimpleAbly.ts                 # Ably real-time communication for mobile sync
└── components/
    ├── MobileRecordingQRV2.tsx          # QR code generation and mobile pairing
    └── AudioSettingsModal.tsx           # Mobile audio configuration

src/features/clinical/main-ui/hooks/
└── useTranscription.ts                  # SHARED: Core recording logic for both desktop AND mobile
    ├── UseTranscriptionOptions.isMobile # Mobile mode flag
    ├── onChunkComplete()                # Mobile-specific audio chunk handler
    └── Mobile-specific audio processing # Bypasses direct Deepgram calls
```

### State Management
```
src/stores/
├── consultationStore.ts                # Patient session data, generated notes, consultation items
├── transcriptionStore.ts               # Real-time transcription accumulation and display
└── mobileStore.ts                       # Mobile connection state and token management

src/hooks/
├── useConsultationStores.ts             # Unified hook combining all stores with business logic
├── useRecordingAwareSession.ts          # Session switching with recording control context
└── consultation/
    └── useConsultationQueries.ts        # TanStack Query hooks for API calls
```

### Database Schema & ORM
```
database/
├── client.ts                            # Drizzle database client configuration
├── schema/
│   ├── patient_sessions.ts              # Patient session schema with transcription arrays
│   ├── users.ts                         # User account and session management
│   └── mobile_tokens.ts                 # Mobile device authentication tokens
└── migrations/
    └── *.sql                            # Database migration files
```

### API Routes
```
app/api/
├── (clinical)/
│   ├── deepgram/transcribe/route.ts     # Deepgram speech-to-text integration
│   └── consultation/
│       ├── chat/route.ts                # AI chat functionality
│       └── notes/route.ts               # AI note generation
├── (integration)/
│   ├── ably/simple-token/route.ts       # Ably authentication token generation
│   └── mobile/
│       ├── generate-token/route.ts      # Mobile QR token generation
│       └── active-token/route.ts        # Mobile token validation
└── (user)/
    ├── patient-sessions/route.ts        # CRUD operations for patient sessions
    └── current-session/route.ts         # Current session state management
```

### Client-Side API Layer
```
src/lib/
├── api/
│   └── consultation.ts                  # Client-side API wrapper for session operations
└── services/
    ├── guest-session-service.ts         # Session management utilities
    └── cleanup-service.ts               # Data cleanup and maintenance
```

### Session Management
```
src/features/clinical/session-management/
└── components/
    ├── PatientSessionManager.tsx        # Session switching and patient management
    ├── SessionModal.tsx                 # Session details and editing
    └── CurrentSessionBar.tsx            # Active session status display
```

### Authentication & Security
```
src/lib/
├── rbac-enforcer.ts                     # Role-based access control
└── rbac-client.ts                       # Client-side permission checks

src/shared/utils/
└── index.ts                             # Authentication header utilities
    ├── createAuthHeaders()              # Desktop user authentication
    └── createAuthHeadersForMobile()     # Mobile token authentication
```

### Mobile-Desktop Integration
```
app/(clinical)/consultation/page.tsx     # Desktop: Ably listener, recording control context
app/(integration)/mobile/page.tsx        # Mobile: QR scanning, Ably publishing
src/hooks/useRecordingAwareSession.ts    # Cross-device session management
middleware.ts                            # Request routing and authentication
```

### Audio Processing Pipeline (Shared: Desktop & Mobile)
```
useTranscription.ts
├── initializeAudio()                    # Microphone setup and Web Audio API
├── vadLoop()                            # Voice Activity Detection monitoring
├── startRecordingSession()              # MediaRecorder session management
├── stopRecordingSession()               # Session completion and audio blob creation
└── sendRecordingSession()               # Platform-specific handling:
    ├── Desktop: Direct Deepgram API call + local appendTranscription()
    └── Mobile: onChunkComplete() callback → Ably sync → Desktop processing
```

### Real-time Communication Flow
```
Mobile Device:
useTranscription.ts (isMobile=true) → onChunkComplete(audioBlob) → Mobile page → Deepgram API → Ably Channel

Desktop:
useSimpleAbly.ts → onTranscriptReceived() → appendTranscription() → updatePatientSession()
```

### Database Data Flow
```
Transcription Chunk:
1. appendTranscription() in useConsultationStores.ts
2. updatePatientSession() API call
3. PATCH /api/patient-sessions route
4. Drizzle ORM update to patient_sessions.transcriptions JSON array
5. Database persistence with enhanced metadata
```

### Error Handling & Recovery
```
src/features/clinical/main-ui/hooks/useTranscription.ts  # Audio device and API errors
src/features/clinical/mobile/hooks/useSimpleAbly.ts     # Network and connection errors
src/lib/services/cleanup-service.ts                     # Data maintenance and recovery
app/api/(user)/patient-sessions/route.ts                # Server-side error handling
```

### Key Integration Points
- **useConsultationStores.ts**: Central business logic hub connecting all systems
- **consultation/page.tsx**: Main UI orchestrating desktop and mobile recording
- **useSimpleAbly.ts**: Real-time bridge between mobile and desktop
- **patient_sessions.ts**: Database schema storing all transcription data
- **useTranscription.ts**: SHARED core recording engine used by both desktop and mobile
  - Desktop: Direct Deepgram API calls + local transcription display
  - Mobile: `onChunkComplete` callback + Ably real-time sync to desktop

## Authentication & Security

### Desktop Authentication
- **Clerk Integration**: Full user session management
- **Tier-based Access**: Role-based permissions and feature access
- **Session Persistence**: Secure session state management
- **API Security**: Authenticated endpoints for all operations

### Mobile Authentication
- **QR Code Pairing**: Time-limited token generation
- **Secure Channels**: Encrypted Ably communication
- **Token Rotation**: Automatic expiry and refresh mechanisms
- **Guest Access**: No permanent credentials stored on mobile device

## Clinical Workflow Integration

### Standard GP Workflow
1. **Preparation**: GP selects or creates patient session
2. **Recording**: Start recording (desktop or mobile)
3. **Consultation**: Natural conversation with automatic chunking
4. **Review**: Real-time transcription display and monitoring
5. **Documentation**: Generate clinical notes from transcription
6. **Session Management**: Switch between patients as needed

## Performance Characteristics

### Latency & Responsiveness
- **Transcription Delay**: ~2-5 seconds from speech to text display
- **Network Latency**: <1 second for mobile-to-desktop sync
- **Database Performance**: <100ms for transcription saves
- **UI Updates**: Real-time without perceptible delay

### Scalability
- **Concurrent Users**: Supports multiple simultaneous recordings
- **Session Volume**: Handles high-frequency patient transitions
- **Data Growth**: Efficient storage with automatic cleanup policies
- **Network Load**: Optimised for low-bandwidth mobile connections

## Error Handling & Recovery

### Network Failures
- **Desktop**: Local retry mechanisms and user notifications
- **Mobile**: Graceful disconnection prompts and reconnection logic
- **Data Recovery**: No transcription loss during brief network interruptions

### Authentication Issues
- **Token Expiry**: Clear re-authentication prompts
- **Session Timeout**: Automatic session extension where appropriate
- **Permission Errors**: Informative error messages and recovery paths

### System Failures
- **Audio Device Issues**: Automatic device detection and switching
- **API Failures**: Retry logic with exponential backoff
- **Database Errors**: Transactional safety and rollback capabilities

---

*This document provides a high-level overview of ClinicPro's recording systems. For implementation details, refer to the relevant source code and API documentation.*
