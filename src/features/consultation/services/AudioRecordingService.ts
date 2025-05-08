import { AudioProcessingService } from '@/features/consultation/services/AudioProcessingService';

export class AudioRecordingService {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onChunkCallback: ((chunk: ArrayBuffer) => void) | null = null;
  private readonly TARGET_SAMPLE_RATE = 16000; // Deepgram's preferred sample rate
  private readonly BUFFER_SIZE = 4096;
  private paused: boolean = false;

  async verifySetup(): Promise<void> {
    try {
      // Check if audio context is supported
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        throw new Error('AudioContext not supported in this browser');
      }

      // Check if audio worklet is supported
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext.audioWorklet) {
        throw new Error('AudioWorklet not supported in this browser');
      }
      await audioContext.close();

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }

      // Test microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Audio setup verification failed:', error);
      throw error;
    }
  }

  async startRecording(onChunk: (chunk: ArrayBuffer) => void): Promise<void> {
    try {
      // Request audio with higher sample rate for better quality
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Create AudioContext with higher sample rate
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000
      });

      // Load and register the audio worklet
      await this.audioContext.audioWorklet.addModule('/audio/transcription-processor.js');

      // Log audio context configuration
      console.error('AudioContext configuration:', {
        sampleRate: this.audioContext.sampleRate,
        state: this.audioContext.state,
        baseLatency: this.audioContext.baseLatency
      });

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Create worklet node with resampling
      this.workletNode = new AudioWorkletNode(this.audioContext, 'transcription-processor', {
        processorOptions: {
          targetSampleRate: this.TARGET_SAMPLE_RATE,
          bufferSize: this.BUFFER_SIZE
        }
      });

      this.paused = false;
      this.onChunkCallback = (chunk: ArrayBuffer) => {
        if (!this.paused && onChunk) {
          onChunk(chunk);
        }
      };

      // Handle messages from the worklet
      this.workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio' && this.onChunkCallback) {
          this.onChunkCallback(event.data.buffer);
        } else if (event.data.type === 'stats') {
          console.error('Audio worklet stats:', event.data.stats);
        } else if (event.data.type === 'error') {
          console.error('Audio worklet error:', event.data.error);
        }
      };

      // Handle worklet errors
      this.workletNode.onprocessorerror = (error) => {
        console.error('Audio worklet processor error:', error);
        throw error;
      };

      this.source.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);

      // Log successful initialization
      console.error('Audio recording initialized successfully', {
        sampleRate: this.audioContext.sampleRate,
        targetSampleRate: this.TARGET_SAMPLE_RATE,
        bufferSize: this.BUFFER_SIZE,
        state: this.audioContext.state,
        baseLatency: this.audioContext.baseLatency
      });
    } catch (error) {
      console.error('Error starting PCM recording:', error);
      throw error;
    }
  }

  pauseRecording(): void {
    this.paused = true;
    console.error('Audio recording paused');
  }

  resumeRecording(): void {
    this.paused = false;
    console.error('Audio recording resumed');
  }

  stopRecording(): void {
    try {
      if (this.workletNode) {
        this.workletNode.disconnect();
        this.workletNode = null;
      }
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
      if (this.stream) {
        this.stream.getTracks().forEach(track => {
          track.stop();
          console.error('Audio track stopped:', track.label);
        });
        this.stream = null;
      }
      this.onChunkCallback = null;
      this.paused = false;
      console.error('Audio recording stopped successfully');
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  isRecording(): boolean {
    return !!this.audioContext && !!this.workletNode;
  }
}
