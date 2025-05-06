class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = options.processorOptions.targetSampleRate;
    this.bufferSize = options.processorOptions.bufferSize;
    this.resampleRatio = this.targetSampleRate / sampleRate;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.currentFrame = 0;
  }

  process(inputs, _outputs) {
    const input = inputs[0][0];
    if (!input) return true;

    // Log input stats periodically
    if (this.currentFrame % 48000 === 0) {
      const stats = {
        min: Math.min(...input),
        max: Math.max(...input),
        mean: input.reduce((a, b) => a + b, 0) / input.length,
        length: input.length,
        sampleRate: sampleRate,
        targetSampleRate: this.targetSampleRate,
        resampleRatio: this.resampleRatio
      };
      this.port.postMessage({ type: 'stats', stats });
    }
    this.currentFrame += input.length;

    // Fill the buffer
    for (let i = 0; i < input.length; i++) {
      this.buffer[this.bufferIndex++] = input[i];

      // When buffer is full, process and send
      if (this.bufferIndex >= this.bufferSize) {
        // Resample to target sample rate
        const resampled = this.resample(this.buffer, this.resampleRatio);
        
        // Convert to Int16Array
        const pcm = new Int16Array(resampled.length);
        for (let j = 0; j < resampled.length; j++) {
          const s = Math.max(-1, Math.min(1, resampled[j]));
          pcm[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send the processed audio
        this.port.postMessage({
          type: 'audio',
          buffer: pcm.buffer
        }, [pcm.buffer]);

        // Reset buffer
        this.bufferIndex = 0;
      }
    }

    return true;
  }

  resample(input, ratio) {
    const outputLength = Math.round(input.length * ratio);
    const output = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const inputIndex = i / ratio;
      const inputIndexFloor = Math.floor(inputIndex);
      const inputIndexCeil = Math.min(inputIndexFloor + 1, input.length - 1);
      const fraction = inputIndex - inputIndexFloor;
      
      output[i] = input[inputIndexFloor] * (1 - fraction) + input[inputIndexCeil] * fraction;
    }
    
    return output;
  }
}

registerProcessor('transcription-processor', AudioProcessor); 