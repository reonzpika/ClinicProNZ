/**
 * Image Edit Modal
 * 
 * Full-screen modal for editing images:
 * - Rotate (90° increments)
 * - Crop (non-destructive, stores coordinates)
 * - Add arrows (click and drag to point)
 * - Undo/Redo
 * - Previous/Next navigation
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCw, RotateCcw, Crop, ArrowRight, Undo2, Redo2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/src/shared/components/ui/dialog';
import { Button } from '@/src/shared/components/ui/button';
import type { WidgetImage } from '../../types';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: WidgetImage | null;
  allImages: WidgetImage[];
  onImageSelect?: (imageId: string) => void;
}

interface EditState {
  rotation: number;
  crop: { x: number; y: number; width: number; height: number } | null;
  arrows: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>;
}

interface HistoryState {
  state: EditState;
  timestamp: number;
}

export function ImageEditModal({
  isOpen,
  onClose,
  image,
  allImages,
  onImageSelect,
}: ImageEditModalProps) {
  const { updateMetadata } = useImageWidgetStore();
  const [currentImageId, setCurrentImageId] = useState<string | null>(image?.id || null);
  const [editState, setEditState] = useState<EditState>({
    rotation: 0,
    crop: null,
    arrows: [],
  });
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTool, setActiveTool] = useState<'rotate' | 'crop' | 'arrow' | null>(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isArrowDragging, setIsArrowDragging] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [arrowEnd, setArrowEnd] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = allImages.find(img => img.id === currentImageId) || image;

  // Initialize edit state from image metadata
  useEffect(() => {
    if (currentImage?.metadata.edits) {
      const edits = currentImage.metadata.edits;
      setEditState({
        rotation: edits.rotation || 0,
        crop: edits.crop || null,
        arrows: (edits.arrows || []).map(arrow => {
          // Handle legacy arrows with angle (convert to x1, y1, x2, y2)
          if ('angle' in arrow && typeof arrow.angle === 'number' && 'x' in arrow && 'y' in arrow) {
            // Legacy format: convert angle + position to end point
            // Assume a default length of 5% for legacy arrows
            const length = 5;
            const angleRad = (arrow.angle * Math.PI) / 180;
            const x = typeof arrow.x === 'number' ? arrow.x : 0;
            const y = typeof arrow.y === 'number' ? arrow.y : 0;
            return {
              id: arrow.id,
              x1: x,
              y1: y,
              x2: x + (length * Math.cos(angleRad)),
              y2: y + (length * Math.sin(angleRad)),
            };
          }
          // New format: already has x1, y1, x2, y2
          if ('x1' in arrow && 'y1' in arrow && 'x2' in arrow && 'y2' in arrow) {
            return {
              id: arrow.id,
              x1: typeof arrow.x1 === 'number' ? arrow.x1 : 0,
              y1: typeof arrow.y1 === 'number' ? arrow.y1 : 0,
              x2: typeof arrow.x2 === 'number' ? arrow.x2 : 0,
              y2: typeof arrow.y2 === 'number' ? arrow.y2 : 0,
            };
          }
          // Fallback: create a default arrow if format is unknown
          return {
            id: arrow.id,
            x1: 0,
            y1: 0,
            x2: 5,
            y2: 5,
          };
        }),
      });
      // Reset history when switching images
      setHistory([]);
      setHistoryIndex(-1);
    } else {
      setEditState({
        rotation: 0,
        crop: null,
        arrows: [],
      });
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [currentImageId, currentImage]);

  // Save state to history
  const saveToHistory = useCallback((state: EditState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      state: { ...state },
      timestamp: Date.now(),
    });
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    setHistory(newHistory);
  }, [history, historyIndex]);

  // Update edit state and save to history
  const updateEditState = useCallback((updates: Partial<EditState>) => {
    setEditState(prev => {
      const newState = { ...prev, ...updates };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const historyItem = history[newIndex];
      if (historyItem) {
        setHistoryIndex(newIndex);
        setEditState({ ...historyItem.state });
      }
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const historyItem = history[newIndex];
      if (historyItem) {
        setHistoryIndex(newIndex);
        setEditState({ ...historyItem.state });
      }
    }
  }, [history, historyIndex]);

  // Rotate 90° clockwise
  const handleRotate90 = useCallback(() => {
    updateEditState({ rotation: (editState.rotation + 90) % 360 });
  }, [editState.rotation, updateEditState]);

  // Rotate 90° counter-clockwise
  const handleRotateCCW90 = useCallback(() => {
    updateEditState({ rotation: (editState.rotation - 90 + 360) % 360 });
  }, [editState.rotation, updateEditState]);

  // Helper function to transform mouse coordinates to natural image coordinates
  const transformMouseToNatural = useCallback((mouseX: number, mouseY: number, img: HTMLImageElement, rotation: number) => {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayedWidth = img.offsetWidth;
    const displayedHeight = img.offsetHeight;
    
    // Calculate scale factor (object-contain uses the smaller scale)
    const scaleX = displayedWidth / naturalWidth;
    const scaleY = displayedHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Actual displayed image size
    const actualDisplayedWidth = naturalWidth * scale;
    const actualDisplayedHeight = naturalHeight * scale;
    
    // Center offset
    const offsetX = (displayedWidth - actualDisplayedWidth) / 2;
    const offsetY = (displayedHeight - actualDisplayedHeight) / 2;
    
    // Adjust for centering
    let x = mouseX - offsetX;
    let y = mouseY - offsetY;
    
    // Convert to natural coordinates first (before rotation)
    x = x / scale;
    y = y / scale;
    
    // Apply inverse rotation transformation
    // For 90° clockwise forward: (x, y) -> (y, naturalHeight - x)
    // Inverse: (x, y) -> (naturalHeight - y, x)
    if (rotation === 90) {
      const tempX = x;
      x = naturalHeight - y;
      y = tempX;
    } else if (rotation === 270) {
      // For 270° clockwise forward: (x, y) -> (naturalWidth - y, x)
      // Inverse: (x, y) -> (y, naturalWidth - x)
      const tempX = x;
      x = y;
      y = naturalWidth - tempX;
    } else if (rotation === 180) {
      x = naturalWidth - x;
      y = naturalHeight - y;
    }
    // 0°: no transformation needed
    
    return { x, y };
  }, []);

  // Start crop
  const handleCropStart = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current || activeTool !== 'crop') return;
    e.preventDefault();
    e.stopPropagation();
    
    const imgRect = imageRef.current.getBoundingClientRect();
    const img = imageRef.current;
    
    // Calculate position relative to displayed image bounding box
    const mouseX = e.clientX - imgRect.left;
    const mouseY = e.clientY - imgRect.top;
    
    // Transform to natural image coordinates
    const { x, y } = transformMouseToNatural(mouseX, mouseY, img, editState.rotation);
    
    // Only start crop if click is within image bounds
    if (x >= 0 && x <= img.naturalWidth && y >= 0 && y <= img.naturalHeight) {
      setCropStart({ x, y });
      setCropEnd({ x, y });
      setIsCropMode(true);
    }
  }, [activeTool, editState.rotation, transformMouseToNatural]);

  // Helper function to transform natural coordinates to displayed coordinates
  const transformNaturalToDisplayed = useCallback((naturalX: number, naturalY: number, img: HTMLImageElement, rotation: number) => {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayedWidth = img.offsetWidth;
    const displayedHeight = img.offsetHeight;
    
    // Calculate scale factor
    const scaleX = displayedWidth / naturalWidth;
    const scaleY = displayedHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Actual displayed image size
    const actualDisplayedWidth = naturalWidth * scale;
    const actualDisplayedHeight = naturalHeight * scale;
    
    // Center offset
    const offsetX = (displayedWidth - actualDisplayedWidth) / 2;
    const offsetY = (displayedHeight - actualDisplayedHeight) / 2;
    
    let x = naturalX;
    let y = naturalY;
    
    // Apply rotation transformation (forward transform)
    // Rotation matrix for 90° clockwise: [0, 1; -1, 0]
    if (rotation === 90) {
      // 90° clockwise: (x, y) -> (y, naturalHeight - x)
      const tempX = x;
      x = y;
      y = naturalHeight - tempX;
    } else if (rotation === 270) {
      // 270° clockwise: (x, y) -> (naturalWidth - y, x)
      const tempX = x;
      x = naturalWidth - y;
      y = tempX;
    } else if (rotation === 180) {
      x = naturalWidth - x;
      y = naturalHeight - y;
    }
    // 0°: no transformation needed
    
    // Scale to displayed coordinates
    x = x * scale;
    y = y * scale;
    
    return { x: x + offsetX, y: y + offsetY };
  }, []);

  // Update crop while dragging
  const handleCropMove = useCallback((e: React.MouseEvent) => {
    if (!cropStart || !imageRef.current || !isCropMode) return;
    e.preventDefault();
    
    const imgRect = imageRef.current.getBoundingClientRect();
    const img = imageRef.current;
    
    // Calculate position relative to displayed image bounding box
    const mouseX = e.clientX - imgRect.left;
    const mouseY = e.clientY - imgRect.top;
    
    // Transform to natural image coordinates
    const { x, y } = transformMouseToNatural(mouseX, mouseY, img, editState.rotation);
    
    // Clamp to natural image bounds
    const clampedX = Math.max(0, Math.min(img.naturalWidth, x));
    const clampedY = Math.max(0, Math.min(img.naturalHeight, y));
    setCropEnd({ x: clampedX, y: clampedY });
  }, [cropStart, isCropMode, editState.rotation, transformMouseToNatural]);

  // End crop
  const handleCropEnd = useCallback(() => {
    if (!cropStart || !cropEnd || !imageRef.current || !isCropMode) {
      setIsCropMode(false);
      setCropStart(null);
      setCropEnd(null);
      return;
    }

    const img = imageRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // Crop coordinates are already in natural image space
    const x1 = Math.min(cropStart.x, cropEnd.x);
    const y1 = Math.min(cropStart.y, cropEnd.y);
    const x2 = Math.max(cropStart.x, cropEnd.x);
    const y2 = Math.max(cropStart.y, cropEnd.y);

    const width = x2 - x1;
    const height = y2 - y1;

    if (width > 10 && height > 10) {
      // Convert to percentage of natural image dimensions
      updateEditState({
        crop: {
          x: (x1 / naturalWidth) * 100,
          y: (y1 / naturalHeight) * 100,
          width: (width / naturalWidth) * 100,
          height: (height / naturalHeight) * 100,
        },
      });
    }

    setIsCropMode(false);
    setCropStart(null);
    setCropEnd(null);
  }, [cropStart, cropEnd, isCropMode, updateEditState]);

  // Start arrow drag
  const handleArrowStart = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current || activeTool !== 'arrow') return;
    e.preventDefault();
    e.stopPropagation();
    
    const imgRect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - imgRect.left;
    const y = e.clientY - imgRect.top;
    
    // Only start if click is within image bounds
    if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
      setIsArrowDragging(true);
      setArrowStart({ x, y });
      setArrowEnd({ x, y });
    }
  }, [activeTool]);

  // Update arrow while dragging
  const handleArrowMove = useCallback((e: React.MouseEvent) => {
    if (!arrowStart || !imageRef.current || !isArrowDragging) return;
    e.preventDefault();
    
    const imgRect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(imgRect.width, e.clientX - imgRect.left));
    const y = Math.max(0, Math.min(imgRect.height, e.clientY - imgRect.top));
    setArrowEnd({ x, y });
  }, [arrowStart, isArrowDragging]);

  // End arrow drag
  const handleArrowEnd = useCallback(() => {
    if (!arrowStart || !arrowEnd || !imageRef.current || !isArrowDragging) {
      setIsArrowDragging(false);
      setArrowStart(null);
      setArrowEnd(null);
      return;
    }

    const imgRect = imageRef.current.getBoundingClientRect();
    
    // Calculate distance - only add arrow if dragged more than 10px
    const dx = arrowEnd.x - arrowStart.x;
    const dy = arrowEnd.y - arrowStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 10) {
      // Convert both start and end positions to percentages
      const x1 = (arrowStart.x / imgRect.width) * 100;
      const y1 = (arrowStart.y / imgRect.height) * 100;
      const x2 = (arrowEnd.x / imgRect.width) * 100;
      const y2 = (arrowEnd.y / imgRect.height) * 100;

      const newArrow = {
        id: `arrow-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        x1: Math.max(0, Math.min(100, x1)),
        y1: Math.max(0, Math.min(100, y1)),
        x2: Math.max(0, Math.min(100, x2)),
        y2: Math.max(0, Math.min(100, y2)),
      };

      updateEditState({
        arrows: [...editState.arrows, newArrow],
      });
    }

    setIsArrowDragging(false);
    setArrowStart(null);
    setArrowEnd(null);
  }, [arrowStart, arrowEnd, isArrowDragging, editState.arrows, updateEditState]);

  // Delete arrow
  const handleDeleteArrow = useCallback((arrowId: string) => {
    updateEditState({
      arrows: editState.arrows.filter(a => a.id !== arrowId),
    });
  }, [editState.arrows, updateEditState]);

  // Reset all edits
  const handleReset = useCallback(() => {
    setEditState({
      rotation: 0,
      crop: null,
      arrows: [],
    });
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Save edits to metadata
  const handleSave = useCallback(() => {
    if (!currentImageId) return;

    updateMetadata(currentImageId, {
      edits: {
        rotation: editState.rotation !== 0 ? editState.rotation : undefined,
        crop: editState.crop || undefined,
        arrows: editState.arrows.length > 0 ? editState.arrows : undefined,
      },
    });

    onClose();
  }, [currentImageId, editState, updateMetadata, onClose]);

  // Handle previous image
  const handlePrevious = useCallback(() => {
    if (!currentImageId) return;
    const currentIndex = allImages.findIndex(img => img.id === currentImageId);
    if (currentIndex > 0) {
      // Save current edits before switching
      if (editState) {
        updateMetadata(currentImageId, {
          edits: {
            rotation: editState.rotation !== 0 ? editState.rotation : undefined,
            crop: editState.crop || undefined,
            arrows: editState.arrows.length > 0 ? editState.arrows : undefined,
          },
        });
      }
      const prevImage = allImages[currentIndex - 1];
      if (prevImage) {
        setCurrentImageId(prevImage.id);
        onImageSelect?.(prevImage.id);
      }
    }
  }, [currentImageId, allImages, editState, updateMetadata, onImageSelect]);

  // Handle next image
  const handleNext = useCallback(() => {
    if (!currentImageId) return;
    const currentIndex = allImages.findIndex(img => img.id === currentImageId);
    if (currentIndex < allImages.length - 1) {
      // Save current edits before switching
      if (editState) {
        updateMetadata(currentImageId, {
          edits: {
            rotation: editState.rotation !== 0 ? editState.rotation : undefined,
            crop: editState.crop || undefined,
            arrows: editState.arrows.length > 0 ? editState.arrows : undefined,
          },
        });
      }
      const nextImage = allImages[currentIndex + 1];
      if (nextImage) {
        setCurrentImageId(nextImage.id);
        onImageSelect?.(nextImage.id);
      }
    }
  }, [currentImageId, allImages, editState, updateMetadata, onImageSelect]);

  if (!currentImage) {
    return null;
  }

  const currentIndex = allImages.findIndex(img => img.id === currentImageId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allImages.length - 1;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasChanges = editState.rotation !== 0 || editState.crop !== null || editState.arrows.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen p-0 gap-0 translate-x-[-50%] translate-y-[-50%] left-1/2 top-1/2 rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold text-slate-900">Edit Image</h2>
            {/* Previous/Next Navigation */}
            <div className="flex items-center gap-0.5">
              <Button
                onClick={handlePrevious}
                variant="ghost"
                size="sm"
                disabled={!hasPrevious}
                title="Previous image"
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="text-[10px] text-slate-600 px-1">
                {currentIndex + 1}/{allImages.length}
              </span>
              <Button
                onClick={handleNext}
                variant="ghost"
                size="sm"
                disabled={!hasNext}
                title="Next image"
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button onClick={handleReset} variant="ghost" size="sm" disabled={!hasChanges} className="h-6 px-2 text-[10px]">
              Reset
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm" className="h-6 px-2 text-[10px]">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" disabled={!hasChanges} className="h-6 px-2 text-[10px]">
              <Save className="mr-1 size-3" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-slate-200 px-4 py-2 bg-white">
            <div className="flex items-center gap-1.5">
              {/* Rotate Tools */}
              <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
                <Button
                  onClick={handleRotateCCW90}
                  variant="ghost"
                  size="sm"
                  title="Rotate 90° counter-clockwise"
                  className="h-7 w-7 p-0"
                >
                  <RotateCcw className="size-4" />
                </Button>
                <Button
                  onClick={handleRotate90}
                  variant="ghost"
                  size="sm"
                  title="Rotate 90° clockwise"
                  className="h-7 w-7 p-0"
                >
                  <RotateCw className="size-4" />
                </Button>
                {editState.rotation !== 0 && (
                  <span className="text-xs text-slate-600 ml-1">{editState.rotation}°</span>
                )}
              </div>

              {/* Crop Tool */}
              <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
                <Button
                  onClick={() => {
                    setActiveTool(activeTool === 'crop' ? null : 'crop');
                    if (activeTool === 'crop') {
                      setIsCropMode(false);
                    }
                  }}
                  variant={activeTool === 'crop' ? 'default' : 'ghost'}
                  size="sm"
                  title="Crop"
                  className="h-7 w-7 p-0"
                >
                  <Crop className="size-4" />
                </Button>
                {editState.crop && (
                  <Button
                    onClick={() => updateEditState({ crop: null })}
                    variant="ghost"
                    size="sm"
                    title="Clear crop"
                    className="h-7 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Arrow Tool */}
              <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5">
                <Button
                  onClick={() => setActiveTool(activeTool === 'arrow' ? null : 'arrow')}
                  variant={activeTool === 'arrow' ? 'default' : 'ghost'}
                  size="sm"
                  title="Add arrow (click and drag on image)"
                  className="h-7 w-7 p-0"
                >
                  <ArrowRight className="size-4" />
                </Button>
                {editState.arrows.length > 0 && (
                  <span className="text-xs text-slate-600">{editState.arrows.length}</span>
                )}
              </div>

              {/* Undo/Redo */}
              <div className="flex items-center gap-0.5">
                <Button
                  onClick={handleUndo}
                  variant="ghost"
                  size="sm"
                  disabled={!canUndo}
                  title="Undo"
                  className="h-7 w-7 p-0"
                >
                  <Undo2 className="size-4" />
                </Button>
                <Button
                  onClick={handleRedo}
                  variant="ghost"
                  size="sm"
                  disabled={!canRedo}
                  title="Redo"
                  className="h-7 w-7 p-0"
                >
                  <Redo2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image Preview Area */}
          <div
            ref={containerRef}
            className="flex-1 relative overflow-auto bg-slate-100 p-8"
            onMouseMove={isCropMode ? handleCropMove : isArrowDragging ? handleArrowMove : undefined}
            onMouseUp={isCropMode ? handleCropEnd : isArrowDragging ? handleArrowEnd : undefined}
            onMouseLeave={isCropMode ? handleCropEnd : isArrowDragging ? handleArrowEnd : undefined}
          >
            <div className="flex items-center justify-center h-full">
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={currentImage.preview}
                  alt={currentImage.metadata.label || 'Image'}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `rotate(${editState.rotation}deg)`,
                    transition: 'transform 0.2s',
                    cursor: activeTool === 'crop' ? 'crosshair' : activeTool === 'arrow' ? 'crosshair' : 'default',
                  }}
                  draggable={false}
                  onMouseDown={activeTool === 'crop' ? handleCropStart : activeTool === 'arrow' ? handleArrowStart : undefined}
                />

                {/* Crop Overlay (while dragging) */}
                {isCropMode && cropStart && cropEnd && imageRef.current && (() => {
                  const img = imageRef.current;
                  
                  // Convert natural coordinates to displayed coordinates
                  const start = transformNaturalToDisplayed(cropStart.x, cropStart.y, img, editState.rotation);
                  const end = transformNaturalToDisplayed(cropEnd.x, cropEnd.y, img, editState.rotation);
                  
                  return (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-10"
                      style={{
                        left: `${Math.min(start.x, end.x)}px`,
                        top: `${Math.min(start.y, end.y)}px`,
                        width: `${Math.abs(end.x - start.x)}px`,
                        height: `${Math.abs(end.y - start.y)}px`,
                      }}
                    />
                  );
                })()}

                {/* Arrow Preview (while dragging) */}
                {isArrowDragging && arrowStart && arrowEnd && imageRef.current && (
                  <svg
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: 0,
                      top: 0,
                      width: imageRef.current.offsetWidth,
                      height: imageRef.current.offsetHeight,
                    }}
                  >
                    <defs>
                      <marker
                        id="arrowhead-preview"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
                      </marker>
                    </defs>
                    <line
                      x1={arrowStart.x}
                      y1={arrowStart.y}
                      x2={arrowEnd.x}
                      y2={arrowEnd.y}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead-preview)"
                    />
                  </svg>
                )}

                {/* Crop Display (saved crop) */}
                {editState.crop && !isCropMode && imageRef.current && (() => {
                  const img = imageRef.current;
                  const naturalWidth = img.naturalWidth;
                  const naturalHeight = img.naturalHeight;
                  
                  // Convert percentage to natural coordinates
                  const cropX = (editState.crop.x / 100) * naturalWidth;
                  const cropY = (editState.crop.y / 100) * naturalHeight;
                  const cropWidth = (editState.crop.width / 100) * naturalWidth;
                  const cropHeight = (editState.crop.height / 100) * naturalHeight;
                  
                  // Convert top-left corner and bottom-right corner to displayed coordinates
                  const topLeft = transformNaturalToDisplayed(cropX, cropY, img, editState.rotation);
                  const bottomRight = transformNaturalToDisplayed(cropX + cropWidth, cropY + cropHeight, img, editState.rotation);
                  
                  return (
                    <div
                      className="absolute border-2 border-dashed border-purple-500 bg-purple-500/10 pointer-events-none z-10"
                      style={{
                        left: `${Math.min(topLeft.x, bottomRight.x)}px`,
                        top: `${Math.min(topLeft.y, bottomRight.y)}px`,
                        width: `${Math.abs(bottomRight.x - topLeft.x)}px`,
                        height: `${Math.abs(bottomRight.y - topLeft.y)}px`,
                      }}
                    />
                  );
                })()}

                {/* Arrows */}
                {editState.arrows.length > 0 && imageRef.current && (
                  <svg
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: 0,
                      top: 0,
                      width: imageRef.current.offsetWidth,
                      height: imageRef.current.offsetHeight,
                    }}
                  >
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
                      </marker>
                    </defs>
                    {editState.arrows.map((arrow) => {
                      const imgWidth = imageRef.current!.offsetWidth;
                      const imgHeight = imageRef.current!.offsetHeight;
                      
                      const x1 = (arrow.x1 / 100) * imgWidth;
                      const y1 = (arrow.y1 / 100) * imgHeight;
                      const x2 = (arrow.x2 / 100) * imgWidth;
                      const y2 = (arrow.y2 / 100) * imgHeight;
                      
                      return (
                        <g 
                          key={arrow.id}
                          className="pointer-events-auto cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeTool === 'arrow') {
                              handleDeleteArrow(arrow.id);
                            }
                          }}
                        >
                          {activeTool === 'arrow' && (
                            <title>Click to delete</title>
                          )}
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#ef4444"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                            className="hover:stroke-red-700"
                          />
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
