import { createClient } from '@deepgram/sdk';

import { errorRecoveryService } from '../error/error-recovery';

// Validate environment variable
if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('Missing DEEPGRAM_API_KEY');
}

// Initialize Deepgram client with API key
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Types for transcription results
export type TranscriptionResult = {
  transcript: string; // The transcribed text
  isFinal: boolean; // Whether this is a final or interim result
  confidence: number; // Confidence score (0-1) of the transcription
  metadata?: { // Additional transcription details
    start: number; // Start time of the utterance
    duration: number; // Duration of the utterance
    words: Array<{ // Word-level details
      word: string; // The transcribed word
      start: number; // Start time of the word
      end: number; // End time of the word
      confidence: number; // Confidence score for this word
    }>;
    speakers?: Array<{ // Speaker identification
      id: number; // Speaker identifier
      role: 'doctor' | 'patient'; // Speaker role
      startTime: number; // Start time of speaker segment
      endTime: number; // End time of speaker segment
    }>;
  };
  redacted?: boolean; // Whether the text contains redacted information
  redactedNames?: string[]; // List of redacted names
  performance?: PerformanceMetrics; // Performance metrics
};

// Enhanced error types
export type TranscriptionError = {
  message: string; // Error message
  code: 'NETWORK_ERROR' | 'API_ERROR' | 'AUDIO_ERROR' | 'REDACTION_ERROR'; // Specific error type
  retryable: boolean; // Whether the error can be retried
  details?: any; // Additional error details
};

// Performance metrics type
export type PerformanceMetrics = {
  latency: number; // Time from audio input to transcription
  processingTime: number; // Time taken to process the audio
  redactionCount: number; // Number of redactions performed
  wordCount: number; // Number of words transcribed
  speakerCount: number; // Number of speakers detected
};

export class DeepgramService {
  private static instance: DeepgramService;
  private connection: any = null;
  private isConnected: boolean = false;
  private startTime: number = 0;

  private constructor() {}

  // Singleton pattern to ensure only one instance exists
  public static getInstance(): DeepgramService {
    if (!DeepgramService.instance) {
      DeepgramService.instance = new DeepgramService();
    }
    return DeepgramService.instance;
  }

  public async startTranscription(
    onTranscript: (result: TranscriptionResult) => void,
    onError: (error: TranscriptionError) => void,
  ): Promise<void> {
    try {
      this.startTime = Date.now();

      // Create a live connection with optimized settings for medical transcription
      this.connection = deepgram.listen.live({
        // Model and Language Settings
        model: 'nova-2', // Latest model with improved accuracy
        language: 'en-NZ', // New Zealand English dialect
        smart_format: true, // Format numbers, dates, times, etc.
        interim_results: true, // Get real-time transcription updates

        // Transcription Quality Settings
        punctuate: true, // Add punctuation for better readability
        diarize: true, // Separate speakers (doctor/patient)
        utterances: true, // Better sentence segmentation
        vad_events: true, // Voice activity detection

        // Audio Processing Settings
        encoding: 'linear16', // Audio encoding format
        sample_rate: 16000, // Sample rate in Hz
        channels: 1, // Mono audio

        // Privacy and Security Settings
        redact: [
          'pci', // Payment card information
          'ssn', // Social security numbers
          'credit_card', // Credit card numbers
          'email', // Email addresses
          'phone', // Phone numbers
          'date_of_birth', // Date of birth
          'address', // Physical addresses
          'nhi', // New Zealand NHI numbers
          'ird', // New Zealand IRD numbers
          'passport', // Passport numbers
          'drivers_license', // Driver's license numbers
          'name', // Personal names
          'first_name', // First names
          'last_name', // Last names
          'full_name', // Full names
        ],
        replace: '***', // Replace redacted content with asterisks

        // Medical-Specific Optimizations
        keywords: [
          // Common medical terms
          'patient',
          'doctor',
          'symptoms',
          'diagnosis',
          'treatment',
          'medication',
          'prescription',
          'history',
          'examination',
          // New Zealand specific terms
          'whānau',
          'GP',
          'ACC',
          'DHB',
          'PHO',
          'kaimahi',
          'tāngata',
          'hauora',
          'rongoā',
        ],
        keywords_threshold: 0.5, // Confidence threshold for keyword detection

        // Performance Optimizations
        endpointing: 200, // End of utterance detection (ms)
        interim_results_interval: 0.5, // Time between interim results (s)
        vad_turnoff: 500, // Voice activity detection threshold (ms)
      });

      // Handle connection open event
      this.connection.on('open', () => {
        this.isConnected = true;
        console.log('Deepgram connection opened');
      });

      // Handle transcription results
      this.connection.on('transcriptReceived', (data: any) => {
        const processingStartTime = Date.now();

        // Extract transcription data
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final;
        const confidence = data.channel.alternatives[0].confidence;

        // Extract metadata for detailed analysis
        const metadata = {
          start: data.start,
          duration: data.duration,
          words: data.channel.alternatives[0].words || [],
          speakers: data.channel.alternatives[0].speakers?.map((speaker: any) => ({
            id: speaker.id,
            role: speaker.role === 'speaker_0' ? 'doctor' : 'patient',
            startTime: speaker.start,
            endTime: speaker.end,
          })) || [],
        };

        // Check if any content was redacted
        const redacted = data.channel.alternatives[0].redacted || false;

        // Extract redacted names if any
        const redactedNames = data.channel.alternatives[0].entities
          ?.filter((entity: any) => entity.type === 'name')
          ?.map((entity: any) => entity.value) || [];

        // Calculate performance metrics
        const performance: PerformanceMetrics = {
          latency: processingStartTime - this.startTime,
          processingTime: Date.now() - processingStartTime,
          redactionCount: redactedNames.length,
          wordCount: transcript.split(/\s+/).length,
          speakerCount: metadata.speakers.length,
        };

        // Send transcription result to callback
        onTranscript({
          transcript,
          isFinal,
          confidence,
          metadata,
          redacted,
          redactedNames,
          performance,
        });
      });

      // Handle errors with recovery mechanism
      this.connection.on('error', async (error: any) => {
        this.isConnected = false;
        console.error('Deepgram error:', error);

        // Create enhanced error object
        const enhancedError: TranscriptionError = {
          message: error.message,
          code: this.determineErrorCode(error),
          retryable: this.isErrorRetryable(error),
          details: error.details,
        };

        // Attempt error recovery with retry mechanism
        const recovered = await errorRecoveryService.handleError(
          new Error(error.message),
          'api',
          { maxRetries: 3, retryDelay: 1000 },
        );

        if (!recovered) {
          onError(enhancedError);
        }
      });

      // Handle connection close event
      this.connection.on('close', () => {
        this.isConnected = false;
        console.log('Deepgram connection closed');
      });
    } catch (error) {
      console.error('Failed to start transcription:', error);
      throw this.createEnhancedError(error);
    }
  }

  // Helper method to determine error code
  private determineErrorCode(error: any): TranscriptionError['code'] {
    if (error.message?.includes('network')) {
      return 'NETWORK_ERROR';
    }
    if (error.message?.includes('audio')) {
      return 'AUDIO_ERROR';
    }
    if (error.message?.includes('redact')) {
      return 'REDACTION_ERROR';
    }
    return 'API_ERROR';
  }

  // Helper method to determine if error is retryable
  private isErrorRetryable(error: any): boolean {
    const retryableCodes = ['NETWORK_ERROR', 'API_ERROR'];
    return retryableCodes.includes(this.determineErrorCode(error));
  }

  // Helper method to create enhanced error
  private createEnhancedError(error: any): TranscriptionError {
    return {
      message: error.message || 'Unknown error occurred',
      code: this.determineErrorCode(error),
      retryable: this.isErrorRetryable(error),
      details: error.details || {},
    };
  }

  // Send audio data to Deepgram
  public async sendAudioData(audioData: Buffer): Promise<void> {
    if (!this.isConnected || !this.connection) {
      throw this.createEnhancedError(new Error('Deepgram connection not established'));
    }

    try {
      await this.connection.send(audioData);
    } catch (error) {
      console.error('Failed to send audio data:', error);
      throw this.createEnhancedError(error);
    }
  }

  // Stop transcription and clean up connection
  public async stopTranscription(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.finish();
        this.connection = null;
        this.isConnected = false;
      } catch (error) {
        console.error('Failed to stop transcription:', error);
        throw this.createEnhancedError(error);
      }
    }
  }

  // Check if transcription is currently active
  public isTranscribing(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const deepgramService = DeepgramService.getInstance();
