'use client';

import imageCompression from 'browser-image-compression';
import { Camera, Check, Loader2, Upload, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { nanoid } from 'nanoid';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Arrow as KonvaArrow, Circle as KonvaCircle, Image as KonvaImage, Layer, Line, Rect, Stage } from 'react-konva';
import { retry } from 'ts-retry-promise';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';

export const dynamic = 'force-dynamic';

type Step = 'loading' | 'landing' | 'capture' | 'review' | 'uploading' | 'success' | 'error';

type UsageResponse = {
  tier: 'free' | 'premium';
  imagesUsedThisMonth: number;
  limit: number | null;
};

type ImageFile = {
  id: string;
  file: File;
  previewUrl: string;
};

type PresignedResponse = {
  uploadUrl: string;
  s3Key: string;
  expiresAt: number;
};

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(blob);
  });
}

type Annotation =
  | { id: string; type: 'line'; points: number[] }
  | { id: string; type: 'arrow'; points: number[] }
  | { id: string; type: 'circle'; x: number; y: number; r: number };

type CropRect = { x: number; y: number; width: number; height: number };

function ImageAnnotatorDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageFile | null;
  onSave: (next: { file: File; previewUrl: string }) => void;
}) {
  const { open, onOpenChange, image, onSave } = props;
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<'pen' | 'arrow' | 'circle' | 'crop'>('pen');
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{ kind: 'annotation'; id: string } | { kind: 'crop' }>>([]);

  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState<{ w: number; h: number }>({ w: 320, h: 320 });
  const [imgLayout, setImgLayout] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 320, h: 320 });

  // Load image element when modal opens
  useEffect(() => {
    if (!open || !image) {
      return;
    }
    const el = new window.Image();
    el.onload = () => setImgEl(el);
    el.src = image.previewUrl;
  }, [open, image]);

  // Measure container and compute stage + image layout
  useEffect(() => {
    if (!open) {
      return;
    }
    const update = () => {
      const width = containerRef.current?.clientWidth || Math.max(280, Math.min(420, window.innerWidth - 48));
      const maxH = Math.max(320, Math.min(520, window.innerHeight - 220));
      const size = Math.min(width, maxH);
      setStageSize({ w: size, h: size });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [open]);

  useEffect(() => {
    if (!imgEl) {
      setImgLayout({ x: 0, y: 0, w: stageSize.w, h: stageSize.h });
      return;
    }
    const scale = Math.min(stageSize.w / imgEl.width, stageSize.h / imgEl.height);
    const w = imgEl.width * scale;
    const h = imgEl.height * scale;
    const x = (stageSize.w - w) / 2;
    const y = (stageSize.h - h) / 2;
    setImgLayout({ x, y, w, h });
  }, [imgEl, stageSize]);

  // Reset tool state when closing
  useEffect(() => {
    if (!open) {
      setAnnotations([]);
      setCropRect(null);
      setUndoStack([]);
      setTool('pen');
    }
  }, [open]);

  const getRelativePoint = () => {
    const stage = stageRef.current;
    const pos = stage?.getPointerPosition?.();
    if (!pos) {
      return null;
    }
    return pos as { x: number; y: number };
  };

  const [isDrawing, setIsDrawing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);

  const onPointerDown = () => {
    if (!open) {
      return;
    }
    const p = getRelativePoint();
    if (!p) {
      return;
    }

    setIsDrawing(true);

    if (tool === 'crop') {
      setCropStart({ x: p.x, y: p.y });
      setCropRect({ x: p.x, y: p.y, width: 1, height: 1 });
      setUndoStack(prev => [...prev, { kind: 'crop' }]);
      return;
    }

    const id = nanoid(8);
    setActiveId(id);

    if (tool === 'pen') {
      setAnnotations(prev => [...prev, { id, type: 'line', points: [p.x, p.y] }]);
      setUndoStack(prev => [...prev, { kind: 'annotation', id }]);
      return;
    }
    if (tool === 'arrow') {
      setAnnotations(prev => [...prev, { id, type: 'arrow', points: [p.x, p.y, p.x, p.y] }]);
      setUndoStack(prev => [...prev, { kind: 'annotation', id }]);
      return;
    }
    if (tool === 'circle') {
      setAnnotations(prev => [...prev, { id, type: 'circle', x: p.x, y: p.y, r: 1 }]);
      setUndoStack(prev => [...prev, { kind: 'annotation', id }]);
    }
  };

  const onPointerMove = () => {
    if (!isDrawing) {
      return;
    }
    const p = getRelativePoint();
    if (!p) {
      return;
    }

    if (tool === 'crop') {
      if (!cropStart) {
        return;
      }
      const x = Math.min(cropStart.x, p.x);
      const y = Math.min(cropStart.y, p.y);
      const width = Math.abs(p.x - cropStart.x);
      const height = Math.abs(p.y - cropStart.y);
      setCropRect({ x, y, width, height });
      return;
    }

    if (!activeId) {
      return;
    }

    setAnnotations((prev) => {
      const next = [...prev];
      const idx = next.findIndex(a => a.id === activeId);
      if (idx === -1) {
        return prev;
      }
      const a = next[idx]!;
      if (a.type === 'line') {
        next[idx] = { ...a, points: [...a.points, p.x, p.y] };
      } else if (a.type === 'arrow') {
        next[idx] = { ...a, points: [a.points[0]!, a.points[1]!, p.x, p.y] };
      } else if (a.type === 'circle') {
        const r = Math.max(1, Math.hypot(p.x - a.x, p.y - a.y));
        next[idx] = { ...a, r };
      }
      return next;
    });
  };

  const onPointerUp = () => {
    setIsDrawing(false);
    setActiveId(null);
    setCropStart(null);
  };

  const undo = () => {
    setUndoStack((prev) => {
      const next = [...prev];
      const last = next.pop();
      if (!last) {
        return prev;
      }
      if (last.kind === 'crop') {
        setCropRect(null);
        return next;
      }
      setAnnotations(anns => anns.filter(a => a.id !== last.id));
      return next;
    });
  };

  const clearAll = () => {
    setAnnotations([]);
    setCropRect(null);
    setUndoStack([]);
  };

  const save = async () => {
    if (!image) {
      return;
    }
    const stage = stageRef.current;
    if (!stage?.toDataURL) {
      return;
    }

    const crop = cropRect && cropRect.width >= 20 && cropRect.height >= 20 ? cropRect : null;
    const dataUrl = stage.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/jpeg',
      quality: 0.92,
      ...(crop ? { x: crop.x, y: crop.y, width: crop.width, height: crop.height } : {}),
    });

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `photo-${image.id}.jpg`, { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(file);
    onSave({ file, previewUrl });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] max-w-[560px] p-4">
        <DialogHeader>
          <DialogTitle>Edit photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant={tool === 'pen' ? 'default' : 'outline'} onClick={() => setTool('pen')}>
              Markup
            </Button>
            <Button type="button" size="sm" variant={tool === 'arrow' ? 'default' : 'outline'} onClick={() => setTool('arrow')}>
              Arrow
            </Button>
            <Button type="button" size="sm" variant={tool === 'circle' ? 'default' : 'outline'} onClick={() => setTool('circle')}>
              Circle
            </Button>
            <Button type="button" size="sm" variant={tool === 'crop' ? 'default' : 'outline'} onClick={() => setTool('crop')}>
              Crop
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={undo} disabled={undoStack.length === 0}>
              Undo
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
              Clear
            </Button>
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-600">
              <span>Thickness</span>
              <input
                aria-label="Stroke width"
                type="range"
                min={2}
                max={16}
                value={strokeWidth}
                onChange={e => setStrokeWidth(Number(e.target.value))}
              />
            </div>
          </div>

          <div ref={containerRef} className="w-full">
            <div className="overflow-hidden rounded-md border bg-white">
              <Stage
                ref={stageRef}
                width={stageSize.w}
                height={stageSize.h}
                onMouseDown={onPointerDown}
                onMouseMove={onPointerMove}
                onMouseUp={onPointerUp}
                onTouchStart={onPointerDown}
                onTouchMove={onPointerMove}
                onTouchEnd={onPointerUp}
              >
                <Layer>
                  {/* Base image */}
                  {imgEl && (
                    <KonvaImage image={imgEl} x={imgLayout.x} y={imgLayout.y} width={imgLayout.w} height={imgLayout.h} />
                  )}

                  {/* Annotations */}
                  {annotations.map((a) => {
                    if (a.type === 'line') {
                      return (
                        <Line
                          key={a.id}
                          points={a.points}
                          stroke="#ef4444"
                          strokeWidth={strokeWidth}
                          lineCap="round"
                          lineJoin="round"
                        />
                      );
                    }
                    if (a.type === 'arrow') {
                      return (
                        <KonvaArrow
                          key={a.id}
                          points={a.points}
                          stroke="#ef4444"
                          fill="#ef4444"
                          strokeWidth={strokeWidth}
                          pointerLength={12}
                          pointerWidth={12}
                        />
                      );
                    }
                    return (
                      <KonvaCircle
                        key={a.id}
                        x={a.x}
                        y={a.y}
                        radius={a.r}
                        stroke="#ef4444"
                        strokeWidth={strokeWidth}
                      />
                    );
                  })}

                  {/* Crop */}
                  {cropRect && (
                    <Rect
                      x={cropRect.x}
                      y={cropRect.y}
                      width={cropRect.width}
                      height={cropRect.height}
                      stroke="#22c55e"
                      strokeWidth={3}
                      dash={[8, 6]}
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" className="flex-1" onClick={save} disabled={!image}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobilePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('u');

  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'pdf'>('jpeg');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!token) {
      setError('Missing link token');
      setStep('error');
      return;
    }
    setStep('landing');
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function loadUsage() {
      if (!token) {
        return;
      }
      try {
        const resp = await fetch(`/api/image/usage?u=${encodeURIComponent(token)}`, { cache: 'no-store' });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error(payload?.error || 'Failed to load usage');
        }
        const data = (await resp.json()) as UsageResponse;
        if (!cancelled) {
          setUsage(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load usage');
          setStep('error');
        }
      }
    }
    loadUsage();
    const interval = setInterval(loadUsage, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  const usageLabel = useMemo(() => {
    if (!usage) {
      return 'Loading…';
    }
    if (usage.tier === 'premium') {
      return 'Unlimited (Premium)';
    }
    const limit = usage.limit ?? 20;
    return `${usage.imagesUsedThisMonth}/${limit} this month`;
  }, [usage]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const newImages: ImageFile[] = Array.from(e.target.files).map((file) => ({
      id: nanoid(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
    setStep('review');
    e.target.value = '';
  }

  function removeImage(id: string) {
    setImages(prev => {
      const next = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
  }

  async function compressImage(file: File): Promise<Blob> {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  }

  async function uploadOne(image: ImageFile) {
    if (!token) {
      throw new Error('Missing token');
    }

    const compressed = await compressImage(image.file);

    const presigned = await retry(
      async () => {
        const resp = await fetch('/api/image/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            u: token,
            imageId: image.id,
            contentType: 'image/jpeg',
          }),
        });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error(payload?.message || payload?.error || 'Failed to get upload URL');
        }
        return (await resp.json()) as PresignedResponse;
      },
      { retries: 3, delay: 600, backoff: 'EXPONENTIAL' },
    );

    await retry(
      async () => {
        const resp = await fetch(presigned.uploadUrl, {
          method: 'PUT',
          body: compressed,
          headers: { 'Content-Type': 'image/jpeg' },
        });
        if (!resp.ok) {
          throw new Error('Upload failed');
        }
      },
      { retries: 3, delay: 600, backoff: 'EXPONENTIAL' },
    );

    await retry(
      async () => {
        const resp = await fetch('/api/image/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            u: token,
            imageId: image.id,
            s3Key: presigned.s3Key,
            fileSize: compressed.size,
          }),
        });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error(payload?.message || payload?.error || 'Failed to confirm upload');
        }
      },
      { retries: 3, delay: 600, backoff: 'EXPONENTIAL' },
    );
  }

  async function uploadAsSinglePdf() {
    if (!token) {
      throw new Error('Missing token');
    }
    if (!usage || usage.tier !== 'premium') {
      throw new Error('PDF export requires Premium');
    }
    if (images.length === 0) {
      throw new Error('No images selected');
    }

    const compressedBlobs: Blob[] = [];
    for (const img of images) {
      compressedBlobs.push(await compressImage(img.file));
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < compressedBlobs.length; i++) {
      const blob = compressedBlobs[i]!;
      const dataUrl = await blobToDataUrl(blob);

      if (i > 0) {
        doc.addPage();
      }

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 24;

      const props = doc.getImageProperties(dataUrl);
      const maxW = pageWidth - margin * 2;
      const maxH = pageHeight - margin * 2;

      const ratio = Math.min(maxW / props.width, maxH / props.height);
      const w = props.width * ratio;
      const h = props.height * ratio;
      const x = (pageWidth - w) / 2;
      const y = (pageHeight - h) / 2;

      doc.addImage(dataUrl, 'JPEG', x, y, w, h);
    }

    try {
      doc.setProperties({
        title: 'Clinical Photos',
        subject: 'Clinical Photos',
        author: 'ClinicPro Photo Tool',
        creator: 'ClinicPro',
      });
    } catch {}

    const pdfBlob = doc.output('blob');
    const pdfId = `pdf-${nanoid(10)}`;

    const presigned = await retry(
      async () => {
        const resp = await fetch('/api/image/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            u: token,
            imageId: pdfId,
            contentType: 'application/pdf',
          }),
        });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error(payload?.message || payload?.error || 'Failed to get upload URL');
        }
        return (await resp.json()) as PresignedResponse;
      },
      { retries: 3, delay: 600, backoff: 'EXPONENTIAL' },
    );

    await retry(
      async () => {
        const resp = await fetch(presigned.uploadUrl, {
          method: 'PUT',
          body: pdfBlob,
          headers: { 'Content-Type': 'application/pdf' },
        });
        if (!resp.ok) {
          throw new Error('Upload failed');
        }
      },
      { retries: 3, delay: 600, backoff: 'EXPONENTIAL' },
    );

    await retry(
      async () => {
        const resp = await fetch('/api/image/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            u: token,
            imageId: pdfId,
            s3Key: presigned.s3Key,
            fileSize: pdfBlob.size,
          }),
        });
        if (!resp.ok) {
          const payload = await resp.json().catch(() => ({}));
          throw new Error(payload?.message || payload?.error || 'Failed to confirm upload');
        }
      },
      { retries: 3, delay: 600, backoff: 'EXPONENTIAL' },
    );
  }

  async function startUpload() {
    if (images.length === 0) {
      return;
    }
    setStep('uploading');
    setUploadProgress({ current: 0, total: images.length });

    try {
      if (outputFormat === 'pdf') {
        setUploadProgress({ current: 0, total: 1 });
        await uploadAsSinglePdf();
        setUploadProgress({ current: 1, total: 1 });
        // refresh usage after upload
        if (token) {
          try {
            const resp = await fetch(`/api/image/usage?u=${encodeURIComponent(token)}`, { cache: 'no-store' });
            if (resp.ok) {
              setUsage(await resp.json());
            }
          } catch {}
        }
        setStep('success');
        return;
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img) {
          continue;
        }
        await uploadOne(img);
        setUploadProgress({ current: i + 1, total: images.length });
      }
      // refresh usage after upload
      if (token) {
        try {
          const resp = await fetch(`/api/image/usage?u=${encodeURIComponent(token)}`, { cache: 'no-store' });
          if (resp.ok) {
            setUsage(await resp.json());
          }
        } catch {}
      }
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      setStep('error');
    }
  }

  function reset() {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setUploadProgress({ current: 0, total: 0 });
    setError(null);
    setOutputFormat('jpeg');
    setStep('landing');
  }

  // Loading screen
  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
          <p className="text-slate-600">Loading…</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (step === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-700">{error || 'Something went wrong'}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">ClinicPro Photo Tool</h1>
          <p className="text-sm text-slate-600">Mobile capture</p>
        </header>

        <div className="rounded-lg border bg-white p-3 text-center text-sm text-slate-700">
          Usage:
          {' '}
          <strong>{usageLabel}</strong>
        </div>

        {step === 'landing' && (
          <Card>
            <CardHeader>
              <CardTitle>Get set up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Tip:</strong>
                {' '}
                Save this page to your home screen so you can open it quickly next time.
              </div>
              <Button onClick={() => setStep('capture')} size="lg" className="w-full">
                Start Capturing
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Hidden file inputs (available on capture/review) */}
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

        {step === 'capture' && (
          <Card>
            <CardHeader>
              <CardTitle>Capture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => document.getElementById('camera-input')?.click()}
                className="w-full"
                size="lg"
                type="button"
              >
                <Camera className="mr-2 size-5" />
                Open Camera
              </Button>
              <Button
                onClick={() => document.getElementById('gallery-input')?.click()}
                className="w-full"
                size="lg"
                type="button"
                variant="outline"
              >
                <Upload className="mr-2 size-5" />
                Choose from Gallery
              </Button>
              {images.length > 0 && (
                <Button onClick={() => setStep('review')} className="w-full" type="button" variant="ghost">
                  Review
                  {' '}
                  ({images.length})
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>
                Review (
                {images.length}
                )
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {usage?.tier === 'premium' && (
                <div className="rounded-md border bg-white p-3 text-sm text-slate-700">
                  <div className="mb-2 font-medium text-slate-900">Output format</div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={outputFormat === 'jpeg' ? 'default' : 'outline'}
                      onClick={() => setOutputFormat('jpeg')}
                      className="flex-1"
                    >
                      JPEG
                    </Button>
                    <Button
                      type="button"
                      variant={outputFormat === 'pdf' ? 'default' : 'outline'}
                      onClick={() => setOutputFormat('pdf')}
                      className="flex-1"
                    >
                      PDF
                    </Button>
                  </div>
                  {outputFormat === 'pdf' && (
                    <p className="mt-2 text-xs text-slate-600">
                      PDF uploads as a single file (one photo per page).
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative aspect-square overflow-hidden rounded border bg-white">
                    <img src={img.previewUrl} alt="Preview" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white"
                    >
                      <X className="size-4" />
                    </button>
                    {usage?.tier === 'premium' && (
                      <button
                        type="button"
                        onClick={() => setEditingIndex(idx)}
                        className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-slate-900"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => document.getElementById('camera-input')?.click()}
                  variant="outline"
                  className="flex-1"
                  type="button"
                >
                  Add more
                </Button>
                <Button
                  onClick={startUpload}
                  className="flex-1"
                  type="button"
                  disabled={images.length === 0}
                >
                  Upload
                </Button>
              </div>
              <Button onClick={() => setStep('capture')} variant="ghost" className="w-full" type="button">
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        <ImageAnnotatorDialog
          open={editingIndex !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingIndex(null);
            }
          }}
          image={editingIndex !== null ? images[editingIndex] || null : null}
          onSave={(next) => {
            setImages((prev) => {
              if (editingIndex === null) {
                return prev;
              }
              const current = prev[editingIndex];
              if (current) {
                try {
                  URL.revokeObjectURL(current.previewUrl);
                } catch {}
              }
              const updated = [...prev];
              if (updated[editingIndex]) {
                updated[editingIndex] = { ...updated[editingIndex]!, file: next.file, previewUrl: next.previewUrl };
              }
              return updated;
            });
          }}
        />

        {step === 'uploading' && (
          <Card>
            <CardHeader>
              <CardTitle>Uploading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <Loader2 className="mx-auto mb-2 size-12 animate-spin text-purple-500" />
                <p className="text-sm text-slate-700">
                  {uploadProgress.current}
                  {' '}
                  /
                  {' '}
                  {uploadProgress.total}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress.total ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Uploaded</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="size-8 text-green-600" />
                </div>
              </div>
              <p className="text-center text-sm text-slate-700">
                Return to your desktop to download.
              </p>
              <Button onClick={reset} className="w-full" size="lg" type="button">
                Upload more photos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ImageMobilePage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-purple-500" />
            <p className="text-slate-600">Loading…</p>
          </div>
        </div>
      )}
    >
      <MobilePageContent />
    </Suspense>
  );
}

