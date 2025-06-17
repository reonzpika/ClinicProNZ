'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Mic, MicOff } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useConsultation } from '@/shared/ConsultationContext';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const { microphoneGain, setMicrophoneGain, volumeThreshold, setVolumeThreshold } = useConsultation();
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testVolumeLevel, setTestVolumeLevel] = useState(0);
  
  // Audio testing refs
  const testAudioContextRef = useRef<AudioContext | null>(null);
  const testAnalyserRef = useRef<AnalyserNode | null>(null);
  const testStreamRef = useRef<MediaStream | null>(null);
  const testAnimationRef = useRef<number | null>(null);

  const formatGainValue = (gain: number) => {
    const safeGain = gain ?? 7;
    if (safeGain <= 3) return `${safeGain} (Quiet)`;
    if (safeGain <= 6) return `${safeGain} (Good)`;
    return `${safeGain} (Loud)`;
  };

  const formatThresholdValue = (threshold: number) => {
    return `${(threshold * 100).toFixed(1)}%`;
  };

  // Measure volume for testing
  const measureTestVolume = () => {
    if (!testAnalyserRef.current) {
      return 0;
    }

    const dataArray = new Uint8Array(testAnalyserRef.current.fftSize);
    testAnalyserRef.current.getByteTimeDomainData(dataArray);

    // Compute RMS normalized between 0-1
    let sum = 0;
    for (const value of dataArray) {
      const sample = (value / 128) - 1;
      sum += sample * sample;
    }
    return Math.sqrt(sum / dataArray.length);
  };

  // Test microphone animation loop
  const testLoop = useCallback(() => {
    if (!isTestingMic || !testAnalyserRef.current) {
      return;
    }

    const volume = measureTestVolume();
    const adjustedVolume = volume * (microphoneGain ?? 7);
    const uiVolume = Math.min(adjustedVolume * 2, 1.0);
    
    setTestVolumeLevel(uiVolume);
    testAnimationRef.current = requestAnimationFrame(testLoop);
  }, [isTestingMic, microphoneGain]);

  // Start microphone test
  const startMicTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      testStreamRef.current = stream;

      const audioContext = new AudioContext();
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      sourceNode.connect(analyser);

      testAudioContextRef.current = audioContext;
      testAnalyserRef.current = analyser;
      
      setIsTestingMic(true);
    } catch (error) {
      console.error('Failed to start microphone test:', error);
    }
  };

  // Start test loop when isTestingMic becomes true
  useEffect(() => {
    if (isTestingMic && testAnalyserRef.current) {
      testLoop();
    }
  }, [isTestingMic, testLoop]);

  // Stop microphone test
  const stopMicTest = () => {
    setIsTestingMic(false);
    
    if (testAnimationRef.current) {
      cancelAnimationFrame(testAnimationRef.current);
      testAnimationRef.current = null;
    }

    if (testAudioContextRef.current) {
      testAudioContextRef.current.close();
      testAudioContextRef.current = null;
    }

    if (testStreamRef.current) {
      testStreamRef.current.getTracks().forEach(track => track.stop());
      testStreamRef.current = null;
    }

    testAnalyserRef.current = null;
    setTestVolumeLevel(0);
  };

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen && isTestingMic) {
      stopMicTest();
    }
  }, [isOpen, isTestingMic]);

  useEffect(() => {
    return () => {
      if (isTestingMic) {
        stopMicTest();
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border border-gray-200 shadow-xl rounded-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Settings className="h-5 w-5 text-gray-700" />
            Audio Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Microphone Sensitivity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Microphone Volume Boost
              </label>
              <span className="text-sm text-gray-500">
                {formatGainValue(microphoneGain)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">Quiet</span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={microphoneGain ?? 7}
                onChange={(e) => setMicrophoneGain(Number.parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(((microphoneGain ?? 7) - 1) / 9) * 100}%, #e5e7eb ${(((microphoneGain ?? 7) - 1) / 9) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <span className="text-xs text-gray-400">Loud</span>
            </div>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              💡 Higher settings improve transcription accuracy for quiet voices
            </p>
          </div>

          {/* Voice Detection Threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Background Noise Filter
              </label>
              <span className="text-sm text-gray-500">
                {formatThresholdValue(volumeThreshold)}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">Picks up everything</span>
              <input
                type="range"
                min="0.005"
                max="0.2"
                step="0.005"
                value={volumeThreshold}
                onChange={(e) => setVolumeThreshold(Number.parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((volumeThreshold - 0.005) / 0.195) * 100}%, #e5e7eb ${((volumeThreshold - 0.005) / 0.195) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <span className="text-xs text-gray-400">Ignores noise</span>
            </div>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              💡 Set above background noise level to improve transcription accuracy
            </p>
          </div>

          {/* Test Microphone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Test Your Setup
              </label>
              <Button
                onClick={isTestingMic ? stopMicTest : startMicTest}
                variant={isTestingMic ? "destructive" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                {isTestingMic ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Test
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Start Test
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <p className="text-xs font-medium text-blue-800 mb-1">📋 Setup Instructions:</p>
              <ol className="text-xs text-blue-700 space-y-1 ml-3 list-decimal">
                <li>Click "Start Test" and speak at normal consultation volume</li>
                <li>Adjust "Volume Boost" until your voice shows 40-70%</li>
                <li>Adjust "Noise Filter" to just above the background level</li>
                <li>Verify "Voice Detected" only appears when you speak</li>
              </ol>
            </div>
            
            {/* Live Volume Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Audio Level</span>
                <span className="text-xs text-gray-500">{Math.round(testVolumeLevel * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-100 ${
                    testVolumeLevel > 0.7 ? 'bg-red-500' :
                    testVolumeLevel > 0.3 ? 'bg-yellow-500' :
                    testVolumeLevel > 0.05 ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${Math.min(testVolumeLevel * 100, 100)}%` }}
                />
              </div>
              {isTestingMic && (
                <p className="text-xs text-blue-600">
                  🎤 Speak at your normal consultation volume
                </p>
              )}
              {!isTestingMic && (
                <p className="text-xs text-gray-500">
                  Click "Start Test" to optimize your microphone settings
                </p>
              )}
            </div>
          </div>

          {/* Threshold Indicator */}
          {isTestingMic && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-800">Recording Status</span>
                <span className={`text-xs font-medium ${
                  testVolumeLevel > volumeThreshold ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {testVolumeLevel > volumeThreshold ? '✓ Will Record' : '○ Too Quiet'}
                </span>
              </div>
              <p className="text-xs text-green-700">
                Current: {(testVolumeLevel * 100).toFixed(1)}% | 
                Noise Filter: {(volumeThreshold * 100).toFixed(1)}%
              </p>
              {testVolumeLevel <= volumeThreshold && (
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  💡 Increase Volume Boost or lower Noise Filter to capture your voice
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 