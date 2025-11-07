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
  arrows: Array<{ id: string; x: number; y: number; angle: number }>;
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
        arrows: (edits.arrows || []).map(arrow => ({
          ...arrow,
          angle: arrow.angle ?? 0,
        })),
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

  // Start crop
  const handleCropStart = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current || activeTool !== 'crop') return;
    e.preventDefault();
    e.stopPropagation();
    
    const imgRect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate position relative to image
    const x = e.clientX - imgRect.left;
    const y = e.clientY - imgRect.top;
    
    // Only start crop if click is within image bounds
    if (x >= 0 && x <= imgRect.width && y >= 0 && y <= imgRect.height) {
      setCropStart({ x, y });
      setCropEnd({ x, y });
      setIsCropMode(true);
    }
  }, [activeTool]);

  // Update crop while dragging
  const handleCropMove = useCallback((e: React.MouseEvent) => {
    if (!cropStart || !imageRef.current || !isCropMode) return;
    e.preventDefault();
    
    const imgRect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(imgRect.width, e.clientX - imgRect.left));
    const y = Math.max(0, Math.min(imgRect.height, e.clientY - imgRect.top));
    setCropEnd({ x, y });
  }, [cropStart, isCropMode]);

  // End crop
  const handleCropEnd = useCallback(() => {
    if (!cropStart || !cropEnd || !imageRef.current || !isCropMode) {
      setIsCropMode(false);
      setCropStart(null);
      setCropEnd(null);
      return;
    }

    const imgRect = imageRef.current.getBoundingClientRect();
    
    // Crop coordinates are already relative to image
    const x1 = Math.min(cropStart.x, cropEnd.x);
    const y1 = Math.min(cropStart.y, cropEnd.y);
    const x2 = Math.max(cropStart.x, cropEnd.x);
    const y2 = Math.max(cropStart.y, cropEnd.y);

    const width = x2 - x1;
    const height = y2 - y1;

    if (width > 10 && height > 10) {
      // Convert to percentage of image dimensions
      const imgWidth = imgRect.width;
      const imgHeight = imgRect.height;
      
      updateEditState({
        crop: {
          x: (x1 / imgWidth) * 100,
          y: (y1 / imgHeight) * 100,
          width: (width / imgWidth) * 100,
          height: (height / imgHeight) * 100,
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
      // Calculate angle in degrees (0° = right, 90° = down)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Convert start position to percentage
      const x = (arrowStart.x / imgRect.width) * 100;
      const y = (arrowStart.y / imgRect.height) * 100;

      const newArrow = {
        id: `arrow-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        angle,
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
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Edit Image</h2>
            {/* Previous/Next Navigation */}
            <div className="flex items-center gap-1">
              <Button
                onClick={handlePrevious}
                variant="outline"
                size="sm"
                disabled={!hasPrevious}
                title="Previous image"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">
                {currentIndex + 1} / {allImages.length}
              </span>
              <Button
                onClick={handleNext}
                variant="outline"
                size="sm"
                disabled={!hasNext}
                title="Next image"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleReset} variant="outline" size="sm" disabled={!hasChanges}>
              Reset
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" disabled={!hasChanges}>
              <Save className="mr-2 size-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-slate-200 px-6 py-3 bg-white">
            <div className="flex items-center gap-2">
              {/* Rotate Tools */}
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                <Button
                  onClick={handleRotateCCW90}
                  variant="outline"
                  size="sm"
                  title="Rotate 90° counter-clockwise"
                >
                  <RotateCcw className="size-4" />
                </Button>
                <Button
                  onClick={handleRotate90}
                  variant="outline"
                  size="sm"
                  title="Rotate 90° clockwise"
                >
                  <RotateCw className="size-4" />
                </Button>
                {editState.rotation !== 0 && (
                  <span className="text-xs text-slate-600 ml-2">{editState.rotation}°</span>
                )}
              </div>

              {/* Crop Tool */}
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                <Button
                  onClick={() => {
                    setActiveTool(activeTool === 'crop' ? null : 'crop');
                    if (activeTool === 'crop') {
                      setIsCropMode(false);
                    }
                  }}
                  variant={activeTool === 'crop' ? 'default' : 'outline'}
                  size="sm"
                  title="Crop"
                >
                  <Crop className="size-4" />
                </Button>
                {editState.crop && (
                  <Button
                    onClick={() => updateEditState({ crop: null })}
                    variant="ghost"
                    size="sm"
                    title="Clear crop"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Arrow Tool */}
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
                <Button
                  onClick={() => setActiveTool(activeTool === 'arrow' ? null : 'arrow')}
                  variant={activeTool === 'arrow' ? 'default' : 'outline'}
                  size="sm"
                  title="Add arrow (click and drag on image)"
                >
                  <ArrowRight className="size-4" />
                </Button>
                {editState.arrows.length > 0 && (
                  <span className="text-xs text-slate-600">{editState.arrows.length}</span>
                )}
              </div>

              {/* Undo/Redo */}
              <div className="flex items-center gap-1">
                <Button
                  onClick={handleUndo}
                  variant="outline"
                  size="sm"
                  disabled={!canUndo}
                  title="Undo"
                >
                  <Undo2 className="size-4" />
                </Button>
                <Button
                  onClick={handleRedo}
                  variant="outline"
                  size="sm"
                  disabled={!canRedo}
                  title="Redo"
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
                {isCropMode && cropStart && cropEnd && imageRef.current && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-10"
                    style={{
                      left: `${Math.min(cropStart.x, cropEnd.x)}px`,
                      top: `${Math.min(cropStart.y, cropEnd.y)}px`,
                      width: `${Math.abs(cropEnd.x - cropStart.x)}px`,
                      height: `${Math.abs(cropEnd.y - cropStart.y)}px`,
                    }}
                  />
                )}

                {/* Arrow Preview (while dragging) */}
                {isArrowDragging && arrowStart && arrowEnd && imageRef.current && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${arrowStart.x}px`,
                      top: `${arrowStart.y}px`,
                      transform: `translate(-50%, -50%) rotate(${Math.atan2(arrowEnd.y - arrowStart.y, arrowEnd.x - arrowStart.x) * (180 / Math.PI)}deg)`,
                    }}
                  >
                    <ArrowRight className="size-6 text-blue-500" />
                  </div>
                )}

                {/* Crop Display (saved crop) */}
                {editState.crop && !isCropMode && imageRef.current && (
                  <div
                    className="absolute border-2 border-dashed border-purple-500 bg-purple-500/10 pointer-events-none z-10"
                    style={{
                      left: `${editState.crop.x}%`,
                      top: `${editState.crop.y}%`,
                      width: `${editState.crop.width}%`,
                      height: `${editState.crop.height}%`,
                    }}
                  />
                )}

                {/* Arrows */}
                {editState.arrows.map((arrow) => (
                  <div
                    key={arrow.id}
                    className="absolute pointer-events-auto cursor-pointer group"
                    style={{
                      left: `${arrow.x}%`,
                      top: `${arrow.y}%`,
                      transform: `translate(-50%, -50%) rotate(${arrow.angle}deg)`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeTool === 'arrow') {
                        handleDeleteArrow(arrow.id);
                      }
                    }}
                    title={activeTool === 'arrow' ? 'Click to delete' : ''}
                  >
                    <ArrowRight className="size-6 text-red-500 group-hover:text-red-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
