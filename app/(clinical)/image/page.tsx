'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useAuth } from '@clerk/nextjs';
import {
  AlertCircle,
  Camera,
  CheckCircle,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  QrCode,
  Smartphone,
  Trash2,
  Upload,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';

type UploadedImage = {
  id: string;
  fileName: string;
  fileKey: string;
  url: string;
  size: number;
  uploadedAt: Date;
  analysis?: {
    content: string;
    confidence: number;
    timestamp: Date;
  };
};

export default function ClinicalImagePage() {
  const { userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [showQR, setShowQR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR code URL for mobile uploads
  const qrCodeUrl = typeof window !== 'undefined' ? `${window.location.origin}/clinical-image` : '';

  const uploadFile = async (file: File) => {
    try {
      // Get presigned URL
      const presignResponse = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, fileKey } = await presignResponse.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Create image object
      const newImage: UploadedImage = {
        id: Date.now().toString(),
        fileName: file.name,
        fileKey,
        url: URL.createObjectURL(file),
        size: file.size,
        uploadedAt: new Date(),
      };

      setImages(prev => [...prev, newImage]);
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      for (const file of files) {
        await uploadFile(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeImage = async (image: UploadedImage) => {
    try {
      setIsAnalyzing(image.id);
      setError('');

      const response = await fetch('/api/clinical-images/analyze', {
        method: 'POST',
        headers: createAuthHeaders(userId, userTier),
        body: JSON.stringify({
          fileKey: image.fileKey,
          prompt: analysisPrompt || undefined,
          context: `Clinical image analysis for ${image.fileName}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();

      // Update image with analysis
      setImages(prev =>
        prev.map(img =>
          img.id === image.id
            ? {
                ...img,
                analysis: {
                  content: data.analysis,
                  confidence: Math.random() * 0.3 + 0.7, // Mock confidence
                  timestamp: new Date(),
                },
              }
            : img,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Container size="fluid" className="h-full">
      <div className="flex h-full flex-col py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
              <Camera className="size-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Clinical Images
              </h1>
              <p className="text-sm text-slate-600">
                AI-powered clinical image analysis and documentation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="mr-2 size-4" />
              Mobile Upload
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading
                ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Uploading...
                    </>
                  )
                : (
                    <>
                      <Upload className="mr-2 size-4" />
                      Upload Images
                    </>
                  )}
            </Button>
          </div>
        </div>

        {/* Mobile QR Code */}
        {showQR && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="mr-2 size-5" />
                Mobile Upload
              </CardTitle>
              <CardDescription>
                Scan this QR code with your mobile device to upload clinical images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <QRCodeSVG
                  value={qrCodeUrl}
                  size={200}
                  className="rounded-lg border border-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="flex flex-1 gap-6">
          {/* Images Panel */}
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 size-5" />
                  Clinical Images
                </CardTitle>
                <CardDescription>
                  Upload and analyze clinical images with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto">
                {error && (
                  <div className="mb-4 flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-red-600">
                    <AlertCircle className="size-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {images.length === 0
                  ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
                            <ImageIcon className="size-8 text-slate-400" />
                          </div>
                          <h3 className="mb-2 text-lg font-semibold text-slate-900">
                            No images uploaded
                          </h3>
                          <p className="mb-4 text-slate-600">
                            Upload clinical images to get started with AI analysis
                          </p>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            <Upload className="mr-2 size-4" />
                            Upload Images
                          </Button>
                        </div>
                      </div>
                    )
                  : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {images.map(image => (
                          <Card key={image.id} className="overflow-hidden">
                            <div className="aspect-square bg-slate-100">
                              <img
                                src={image.url}
                                alt={image.fileName}
                                className="size-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="truncate font-medium text-slate-900">
                                  {image.fileName}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeImage(image.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                              <p className="mb-3 text-sm text-slate-600">
                                {formatFileSize(image.size)}
                                {' '}
                                •
                                {image.uploadedAt.toLocaleString()}
                              </p>

                              {image.analysis
                                ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2 text-green-600">
                                        <CheckCircle className="size-4" />
                                        <span className="text-sm font-medium">Analysed</span>
                                      </div>
                                      <div className="rounded-lg bg-slate-50 p-3 text-sm">
                                        {image.analysis.content.substring(0, 100)}
                                        ...
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedImage(image)}
                                      >
                                        <Eye className="mr-2 size-4" />
                                        View Analysis
                                      </Button>
                                    </div>
                                  )
                                : (
                                    <Button
                                      onClick={() => analyzeImage(image)}
                                      disabled={isAnalyzing === image.id}
                                      size="sm"
                                      className="w-full"
                                    >
                                      {isAnalyzing === image.id
                                        ? (
                                            <>
                                              <Loader2 className="mr-2 size-4 animate-spin" />
                                              Analysing...
                                            </>
                                          )
                                        : (
                                            <>
                                              <FileText className="mr-2 size-4" />
                                              Analyse Image
                                            </>
                                          )}
                                    </Button>
                                  )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Panel */}
          <div className="w-80">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Analysis Settings</CardTitle>
                <CardDescription>
                  Configure AI analysis parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="analysis-prompt" className="mb-2 block text-sm font-medium text-slate-700">
                    Analysis Prompt
                  </label>
                  <textarea
                    id="analysis-prompt"
                    value={analysisPrompt}
                    onChange={e => setAnalysisPrompt(e.target.value)}
                    placeholder="Describe what you want to analyze in this image..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">Common Analysis Types</h4>
                  <div className="space-y-1">
                    {[
                      'Identify skin lesions or abnormalities',
                      'Describe wound characteristics',
                      'Analyze X-ray findings',
                      'Assess rash patterns',
                      'Document surgical sites',
                    ].map(prompt => (
                      <button
                        type="button"
                        key={prompt}
                        onClick={() => setAnalysisPrompt(prompt)}
                        className="block w-full rounded-lg bg-slate-50 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedImage && (
                  <div className="border-t pt-4">
                    <h4 className="mb-2 text-sm font-medium text-slate-700">
                      Analysis Results
                    </h4>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-slate-900">
                        {selectedImage.fileName}
                      </div>
                      {selectedImage.analysis && (
                        <div className="rounded-lg bg-slate-50 p-3 text-sm">
                          {selectedImage.analysis.content}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedImage(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          className="hidden"
        />
      </div>
    </Container>
  );
}
