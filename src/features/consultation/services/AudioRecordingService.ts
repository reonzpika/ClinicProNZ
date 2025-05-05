// Remove the import since we don't need it in this file
// import { deepgramService } from './deepgram';

// Types for audio recording
export type AudioRecordingError = {
  message: string;
  code: 'PERMISSION_ERROR' | 'RECORDING_ERROR' | 'PROCESSING_ERROR';
  retryable: boolean;
  details?: any;
};

export class AudioRecordingService {
  private static instance: AudioRecordingService;
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private isRecording: boolean = false;
  private isPaused: boolean = false;

  private constructor() {}

  public static getInstance(): AudioRecordingService {
    if (!AudioRecordingService.instance) {
      AudioRecordingService.instance = new AudioRecordingService();
    }
    return AudioRecordingService.instance;
  }

  public async startRecording(
    onAudioData: (data: Blob) => void,
    onError: (error: AudioRecordingError) => void,
  ): Promise<void> {
    try {
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Match Deepgram requirements
          channelCount: 1, // Mono audio
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Create MediaRecorder with required settings
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else {
        throw new Error('No supported audio format for MediaRecorder');
      }
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType,
      });

      // Handle audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onAudioData(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(250); // Collect data every 250ms
      this.isRecording = true;
      this.isPaused = false;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.createEnhancedError(error, onError);
    }
  }

  public pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }

  public resumeRecording(): void {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }

  public async stopRecording(): Promise<void> {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;

      // Stop all tracks
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }
    }
  }

  public isRecordingActive(): boolean {
    return this.isRecording;
  }

  public isRecordingPaused(): boolean {
    return this.isPaused;
  }

  private createEnhancedError(error: any, onError: (error: AudioRecordingError) => void): void {
    const enhancedError: AudioRecordingError = {
      message: error.message || 'Unknown error occurred',
      code: this.determineErrorCode(error),
      retryable: this.isErrorRetryable(error),
      details: error.details || {},
    };
    onError(enhancedError);
  }

  private determineErrorCode(error: any): AudioRecordingError['code'] {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'PERMISSION_ERROR';
    }
    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'RECORDING_ERROR';
    }
    return 'PROCESSING_ERROR';
  }

  private isErrorRetryable(error: any): boolean {
    return this.determineErrorCode(error) !== 'PERMISSION_ERROR';
  }
}

// Export singleton instance
export const audioRecordingService = AudioRecordingService.getInstance();
