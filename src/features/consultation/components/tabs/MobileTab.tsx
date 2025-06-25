/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-console */
'use client';

import React, { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

// TODO: Integrate with ConsultationContext for global state management
export const MobileTab: React.FC = () => {
  const [qrVisible, setQrVisible] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleGenerateQR = () => {
    setQrVisible(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);

      // TODO: Process files and add to consultation data
      // For now, just simulate adding to compiled data
      fileNames.forEach((fileName) => {
        console.log(`Image: ${fileName}`);
        console.log(`AI Desc: ${fileName} appears normal.`);
      });
    }
  };

  return (
    <div className="space-y-4 pt-3">
      <Button
        onClick={handleGenerateQR}
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
      >
        Generate QR Code
      </Button>

      {qrVisible && (
        <div className="flex flex-col items-center space-y-3 border-t border-slate-100 pt-4">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=consultai-mock"
            alt="QR Code"
            className="size-32 rounded border border-slate-200"
          />
          <div className="text-center">
            <p className="text-xs text-slate-600">
              Scan with mobile device to upload images
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 pt-4">
        <label className="mb-2 block text-sm font-medium text-slate-600">
          Simulate Mobile Capture:
        </label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="text-sm"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <h5 className="mb-2 text-sm font-medium text-slate-600">
            Uploaded Images:
          </h5>
          <div className="space-y-1">
            {uploadedFiles.map((fileName, index) => (
              <div
                key={index}
                className="flex items-center rounded bg-slate-50 px-2 py-1 text-xs text-slate-700"
              >
                <span className="mr-2">📷</span>
                {fileName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
