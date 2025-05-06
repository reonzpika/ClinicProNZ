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
  private audioStream: MediaStream | null = null;
  private isRecording: boolean = false;
  private isPaused: boolean = false;
  private audioContext: AudioContext | null = null;

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

      // Create AudioContext for processing
      this.audioContext = new AudioContext({
        sampleRate: 16000,
      });

      try {
        const source = this.audioContext.createMediaStreamSource(this.audioStream);

        // Create script processor for raw PCM data
        const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32Array to Int16Array (PCM)
          const pcmBuffer = new ArrayBuffer(inputData.length * 2);
          const view = new DataView(pcmBuffer);
          for (let i = 0; i < inputData.length; i++) {
            const sample = Math.max(-1, Math.min(1, inputData[i] ?? 0));
            view.setInt16(i * 2, sample * 0x7FFF, true); // true = little-endian
          }
          const blob = new Blob([pcmBuffer], { type: 'audio/raw' });
          console.error('Captured audio chunk, size:', blob.size);
          onAudioData(blob);
        };

        // Connect nodes
        source.connect(processor);
        processor.connect(this.audioContext.destination);

        this.isRecording = true;
        this.isPaused = false;
      } catch (error) {
        // Clean up AudioContext if there's an error
        await this.audioContext.close();
        throw error;
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.createEnhancedError(error, onError);
    }
  }

  public pauseRecording(): void {
    if (this.audioStream && this.isRecording && !this.isPaused) {
      this.audioStream.getTracks().forEach(track => track.enabled = false);
      this.isPaused = true;
    }
  }

  public resumeRecording(): void {
    if (this.audioStream && this.isRecording && this.isPaused) {
      this.audioStream.getTracks().forEach(track => track.enabled = true);
      this.isPaused = false;
    }
  }

  public async stopRecording(): Promise<void> {
    if (this.audioStream && this.isRecording) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
      this.isRecording = false;
      this.isPaused = false;

      // Close any active AudioContext
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
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
