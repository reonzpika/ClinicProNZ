'use client';

/**
 * Medtech Images Widget - Mobile Page
 *
 * Mobile capture flow accessed via QR code
 *
 * URL: /medtech-images/mobile?t=<token>
 */

import { Camera, Check, Loader2, Upload } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic';

function MobilePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('t');

  const [step, setStep] = useState<'capture' | 'review'>('capture');
  const [files, setFiles] = useState<File[]>([]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              This mobile upload link is invalid or has expired. Please scan the QR code again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setStep('review');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">ClinicPro Images</h1>
          <p className="text-sm text-slate-600">Mobile Upload</p>
        </header>

        {step === 'capture' && (
          <Card>
            <CardHeader>
              <CardTitle>Capture Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => document.getElementById('camera-input')?.click()}
                className="w-full"
                size="lg"
              >
                <Camera className="mr-2 size-5" />
                Open Camera
              </Button>

              <Button
                onClick={() => document.getElementById('gallery-input')?.click()}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Upload className="mr-2 size-5" />
                Choose from Gallery
              </Button>

              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <input
                id="gallery-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Tip:</strong>
{' '}
You can select multiple images at once.
                Images will be compressed automatically before upload.
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>
Review Images (
{files.length}
)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {files.map((file, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded border">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="size-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => document.getElementById('camera-input')?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  Add More
                </Button>

                <Button
                  onClick={() => {
                    alert('Upload functionality: Images would be compressed and sent to desktop');
                    setStep('capture');
                    setFiles([]);
                  }}
                  className="flex-1"
                >
                  <Check className="mr-2 size-4" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function MedtechImagesMobilePage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      )}
    >
      <MobilePageContent />
    </Suspense>
  );
}
