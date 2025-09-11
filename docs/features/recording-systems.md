# ClinicPro Recording Systems

## Overview

ClinicPro provides dual recording capabilities to support flexible clinical workflows: **Desktop Recording** for traditional consultation setups and **Mobile Recording** for remote or mobile consultation scenarios. Both systems deliver identical transcription quality and data persistence through a unified architecture.

## System Architecture

### Core Components
- **Voice Activity Detection (VAD)**: Intelligent speech pattern detection with natural pause recognition
- **Deepgram Integration**: Professional-grade speech-to-text processing
- **Real-time Signalling**: Ably-powered signals to notify desktop to pull updates
- **Direct Database Persistence**: Immediate storage of all transcription chunks
- **Plain Transcript Storage**: Text-only chunks stored for mobile-origin data

### Data Flow Pipeline
```
Continuous Audio → VAD Speech Detection → Natural Pause Recognition → Chunk Creation → Deepgram API → Transcription → Database Storage
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

## Mobile Recording System (Simplified)

### Features
- **Remote Recording**: Record on mobile device; server transcribes and persists
- **QR Link**: QR simply opens `/mobile` (Clerk sign-in required)
- **Server-first Persistence**: Mobile uploads audio to server; server appends to DB
- **Bi-directional Control**: Desktop can remotely start/stop mobile recording (Ably)
- **Wake Lock Support**: Prevents screen timeout during recording sessions

### Technical Characteristics
- **Consistent VAD Logic**: Same intelligent pause detection as desktop
- **Clerk Authentication**: Same account on desktop and mobile
- **Network Resilience**: Automatic reconnection and error recovery
- **Data Quality**: Identical Deepgram processing to desktop
- **Status Signalling**: Real-time recording status updates

### Mobile Workflow (New)
1. Desktop shows a QR that links to `/mobile`
2. User signs in on mobile (Clerk)
3. Mobile records; on chunk, uploads audio to `POST /api/deepgram/transcribe?persist=true`
4. Server transcribes, appends to `patient_sessions.transcriptions`, and signals Ably `user:{userId}`
5. Desktop receives signal and pulls latest session; UI updates
6. Optional: Desktop can send `recording_control` to mobile

## Data Persistence & Reliability

### Database Architecture
- **Chunk-based Storage**: Each natural speech segment stored as individual database entry
- **Mobile Chunks**: Text-only entries `{ id, text, timestamp, source: 'mobile' }`
- **Session Association**: Automatic linking to current patient consultation
- **Real-time Updates**: Desktop pulls on signal + 15s backstop polling
- **Complete History**: Full conversation reconstruction from stored chunks

### Reliability Features
- **Direct Database Saves**: No intermediate caching layers
- **Atomic Operations**: Each transcription chunk saved independently
- **Session Restoration**: Complete conversation reconstruction on session switch
- **Error Recovery**: Graceful handling of network and authentication failures
- **Data Integrity**: Validation for all transcription data

## Local & Server Database Management

### Dual-Layer Architecture
ClinicPro implements a dual-layer data management system that coordinates between local state and server persistence to provide optimal performance and reliability.

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
- **Atomic Transactions**: Database operations ensure data consistency and integrity

### Data Synchronisation Flow

#### Desktop Recording Flow:
```
1. VAD Detects Pause → 2. Create Audio Chunk → 3. Send to Deepgram API
4. Receive Transcription → 5. Update Local Store → 6. Save to Database
7. UI Updates Immediately
```

#### Mobile Recording Flow (Server-first):
```
1. Mobile VAD → 2. Audio Chunk → 3. Mobile POST /api/deepgram/transcribe?persist=true
4. Server Transcribes + Saves → 5. Ably Signal (user:{userId}) → 6. Desktop Pulls & Updates UI
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

#### Session Restoration
- **Complete Reconstruction**: Full conversation rebuilt from database chunks
- **Chunk Concatenation**: Individual transcription entries joined into continuous text
- **State Hydration**: All session components (notes, items, images) loaded simultaneously

### Performance Optimisations
- **Minimal Memory Footprint**: Only current session data held in local stores
- **Reactive Updates**: UI components automatically re-render on state changes
- **Backstop Polling**: Desktop also refetches current session every 15s

### Failure Recovery Mechanisms
- **Local State Recovery**: Failed sessions automatically reload from database
- **Database Recovery**: Transactional safety and rollback capabilities

### Mobile-Desktop Data Coordination
- **Single Source of Truth**: Server database maintains authoritative session data
- **Signal-then-Pull**: Mobile transcriptions persist on server; desktop updates on Ably signal

## File Structure & Code Organization

### Desktop Recording System
```
src/features/clinical/main-ui/
├── hooks/
│   └── useTranscription.ts              # Core VAD logic, audio processing, desktop recording
├── components/
│   ├── TranscriptionControls.tsx        # Recording controls UI (start/stop/pause)
│   ├── EnhancedTranscriptionDisplay.tsx # Real-time transcription display (admin only)
│   └── (Typed input removed)            

app/(clinical)/consultation/
└── page.tsx                             # Main consultation interface with recording integration
```

### Mobile Recording System
```
app/(integration)/mobile/
└── page.tsx                             # Mobile recording interface

src/features/clinical/mobile/
├── hooks/
│   └── useSimpleAbly.ts                 # Ably for control/status + signals
└── components/
    ├── MobileRecordingQRV2.tsx          # QR code (links to /mobile)
    └── AudioSettingsModal.tsx           # Mobile audio configuration

src/features/clinical/main-ui/hooks/
└── useTranscription.ts                  # Shared: core recording logic for both desktop and mobile
    ├── UseTranscriptionOptions.isMobile # Mobile mode flag
    ├── onChunkComplete()                # Mobile-specific audio chunk handler (uploads to server)
```

### State Management
```
src/stores/
├── consultationStore.ts                # Patient session data, generated notes, consultation items
├── transcriptionStore.ts               # Real-time transcription accumulation and display
(mobileStore removed)

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
│   └── users.ts                         # User account and session management (currentSessionId)
└── migrations/
    └── *.sql                            # Database migration files
```

### API Routes
```
app/api/
├── (clinical)/
│   ├── deepgram/transcribe/route.ts     # Deepgram speech-to-text integration (persist=true)
│   └── consultation/
│       ├── chat/route.ts                # AI chat functionality
│       └── notes/route.ts               # AI note generation
├── (integration)/
│   └── ably/user-token/route.ts         # Ably user token (Clerk) for user:{userId}
└── (user)/
    ├── patient-sessions/route.ts        # CRUD operations for patient sessions
    └── current-session/route.ts         # Current session state management
```

### Real-time Communication Flow (New)
```
Mobile:
useTranscription.ts (mobile) → POST transcribe?persist=true → server save → Ably signal

Desktop:
useSimpleAbly.ts (user channel) → onTranscriptionsUpdated() → refetch session → UI update
```

---

*This document describes the simplified server-first recording system.*
