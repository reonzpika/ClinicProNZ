/**
 * Image Preview Component
 * 
 * Large image display with draggable zoom and overlay controls
 */

'use client';

import { Edit2, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { WidgetImage } from '../../types';
import { Button } from '@/src/shared/components/ui/button';
import { formatFileSize } from '../../services/compression';

interface ImagePreviewProps {
  image: WidgetImage | null;
  onEdit: () => void;
}

export function ImagePreview({
  image,
  onEdit,
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  if (!image) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
        <div className="text-center">
          <svg
            className="mx-auto mb-3 size-16 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-slate-600">No image selected</p>
          <p className="text-xs text-slate-500">Upload images to get started</p>
        </div>
      </div>
    );
  }
  
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return; // Only allow drag when zoomed
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Constrain to container bounds
    if (containerRef.current && imageRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();
      
      const maxX = (imageRect.width - containerRect.width) / 2;
      const maxY = (imageRect.height - containerRect.height) / 2;
      
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY)),
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Reset position when zoom changes
  useEffect(() => {
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);
  
  return (
    <div className="relative flex h-full flex-col">
      {/* Image Display Area */}
      <div 
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Overlay Controls */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Edit Button - Top Right */}
          <div className="absolute right-2 top-2 pointer-events-auto">
            <Button
              onClick={onEdit}
              variant="secondary"
              size="sm"
              className="shadow-lg"
            >
              <Edit2 className="size-4" />
            </Button>
          </div>
          
          {/* Zoom Controls - Top Centre */}
          {zoom > 1 && (
            <div className="absolute left-1/2 top-2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg">
              <Button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <ZoomOut className="size-4" />
              </Button>
              
              <span className="text-xs font-medium text-slate-700 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <Button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <ZoomIn className="size-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Image Container */}
        <div 
          className="flex size-full items-center justify-center p-4"
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          onMouseDown={handleMouseDown}
        >
          <img
            ref={imageRef}
            src={image.preview}
            alt={image.metadata.label || 'Clinical image'}
            className="max-h-full max-w-full object-contain select-none"
            style={{ 
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s',
            }}
            draggable={false}
          />
        </div>
        
        {/* Zoom Controls - Bottom (when zoom <= 1) */}
        {zoom <= 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg">
            <Button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <ZoomOut className="size-4" />
            </Button>
            
            <span className="text-xs font-medium text-slate-700 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Image Info - AT BOTTOM */}
      <div className="mt-2 text-xs text-slate-500">
        {image.file.name} • {formatFileSize(image.file.size)}
        {image.metadata.label && ` • ${image.metadata.label}`}
      </div>
    </div>
  );
}
