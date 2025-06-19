// Session sync service for managing in-memory session state
// Extracted from sync-session route to avoid HTTP calls between API routes

export type SessionTranscription = {
  transcript: string;
  timestamp: number;
  source: 'mobile' | 'desktop';
};

export type SessionData = {
  transcriptions: SessionTranscription[];
  lastUpdate: string;
};

// In-memory store for session state (in production, use Redis or database)
const sessionState: Record<string, SessionData> = {};

export class SessionSyncService {
  /**
   * Initialize session state if it doesn't exist
   */
  private static initializeSession(sessionId: string): void {
    if (!sessionState[sessionId]) {
      sessionState[sessionId] = {
        transcriptions: [],
        lastUpdate: new Date().toISOString(),
      };
    }
  }

  /**
   * Add a new transcription to a session
   */
  static addTranscription(
    sessionId: string,
    transcript: string,
    source: 'mobile' | 'desktop',
  ): { success: boolean; lastUpdate: string } {
    this.initializeSession(sessionId);

    const session = sessionState[sessionId]!; // Non-null assertion since we just initialized
    const timestamp = Date.now();

    session.transcriptions.push({
      transcript: transcript.trim(),
      timestamp,
      source,
    });

    session.lastUpdate = new Date().toISOString();

    // Clean up old transcriptions (keep last 100)
    if (session.transcriptions.length > 100) {
      session.transcriptions = session.transcriptions.slice(-100);
    }

    return {
      success: true,
      lastUpdate: session.lastUpdate,
    };
  }

  /**
   * Get transcriptions for a session, optionally filtered by checkpoint
   */
  static getTranscriptions(
    sessionId: string,
    lastCheckpoint?: string,
  ): {
      transcriptions: SessionTranscription[];
      lastUpdate: string;
      hasNewData: boolean;
    } {
    this.initializeSession(sessionId);

    const session = sessionState[sessionId]!; // Non-null assertion since we just initialized
    let transcriptions = session.transcriptions;

    // Filter transcriptions since last checkpoint
    if (lastCheckpoint) {
      const checkpointTime = new Date(lastCheckpoint).getTime();
      transcriptions = session.transcriptions.filter(
        t => t.timestamp > checkpointTime,
      );
    }

    return {
      transcriptions,
      lastUpdate: session.lastUpdate,
      hasNewData: transcriptions.length > 0,
    };
  }

  /**
   * Check if a session exists
   */
  static sessionExists(sessionId: string): boolean {
    return !!sessionState[sessionId];
  }

  /**
   * Get session statistics (for debugging/monitoring)
   */
  static getSessionStats(sessionId: string): {
    transcriptionCount: number;
    lastUpdate: string;
    oldestTranscription?: number;
    newestTranscription?: number;
  } | null {
    if (!sessionState[sessionId]) {
      return null;
    }

    const session = sessionState[sessionId];
    const transcriptions = session.transcriptions;

    return {
      transcriptionCount: transcriptions.length,
      lastUpdate: session.lastUpdate,
      oldestTranscription: transcriptions[0]?.timestamp,
      newestTranscription: transcriptions[transcriptions.length - 1]?.timestamp,
    };
  }

  /**
   * Clear old sessions (cleanup utility)
   */
  static cleanupOldSessions(maxAgeHours: number = 24): number {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let clearedCount = 0;

    for (const [sessionId, session] of Object.entries(sessionState)) {
      const lastUpdateTime = new Date(session.lastUpdate).getTime();
      if (lastUpdateTime < cutoffTime) {
        delete sessionState[sessionId];
        clearedCount++;
      }
    }

    return clearedCount;
  }
}
