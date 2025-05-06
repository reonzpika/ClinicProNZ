export type AudioProcessingOptions = {
  targetSampleRate: number;
  bufferSize: number;
  inputSampleRate: number;
};

export class AudioProcessingService {
  static resample(input: Float32Array, ratio: number): Float32Array {
    const outputLength = Math.round(input.length * ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const inputIndex = i / ratio;
      const inputIndexFloor = Math.floor(inputIndex);
      const inputIndexCeil = Math.min(inputIndexFloor + 1, input.length - 1);
      const fraction = inputIndex - inputIndexFloor;

      // Ensure we have valid indices
      const floorValue = input[inputIndexFloor] ?? 0;
      const ceilValue = input[inputIndexCeil] ?? 0;
      output[i] = floorValue * (1 - fraction) + ceilValue * fraction;
    }

    return output;
  }

  static convertToPCM(input: Float32Array): Int16Array {
    const pcm = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const value = input[i] ?? 0;
      const s = Math.max(-1, Math.min(1, value));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcm;
  }

  static getAudioStats(input: Float32Array) {
    return {
      min: Math.min(...input),
      max: Math.max(...input),
      mean: input.reduce((a, b) => a + b, 0) / input.length,
      length: input.length,
    };
  }
}
