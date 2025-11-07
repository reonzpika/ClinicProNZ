/**
 * Image Edit Modal
 * 
 * Full-screen modal for editing images using react-konva:
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
  DialogTitle,
  DialogDescription,
} from '@/src/shared/components/ui/dialog';
import { Button } from '@/src/shared/components/ui/button';
import type { WidgetImage } from '../../types';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import { Stage, Layer, Image as KonvaImage, Rect, Arrow, Group } from 'react-konva';
import Konva from 'konva';

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
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isArrowDragging, setIsArrowDragging] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [arrowEnd, setArrowEnd] = useState<{ x: number; y: number } | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = allImages.find(img => img.id === currentImageId) || image;

  // Load image
  useEffect(() => {
    if (!currentImage) return;
    
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage.preview;
    img.onload = () => {
      setImageElement(img);
    };
  }, [currentImage]);

  // Update stage size when container resizes
  useEffect(() => {
    if (!isOpen) {
      setStageSize({ width: 0, height: 0 });
      return;
    }
    
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setStageSize({
            width: rect.width,
            height: rect.height,
          });
        }
      }
    };
    
    let resizeObserver: ResizeObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let rafId: number | null = null;
    
    // Try immediate update
    updateSize();
    
    // Use requestAnimationFrame for next frame
    rafId = requestAnimationFrame(() => {
      updateSize();
      
      // Set up ResizeObserver if container is available
      if (containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          updateSize();
        });
        resizeObserver.observe(containerRef.current);
      }
    });
    
    // Also try after a small delay as fallback
    timeoutId = setTimeout(() => {
      updateSize();
      
      // Set up ResizeObserver if not already set up
      if (containerRef.current && !resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          updateSize();
        });
        resizeObserver.observe(containerRef.current);
      }
    }, 100);
    
    // Listen to window resize
    window.addEventListener('resize', updateSize);
    
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateSize);
    };
  }, [isOpen]); // Re-run when modal opens

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
          // Fallback
          return {
            id: arrow.id,
            x1: 0,
            y1: 0,
            x2: 5,
            y2: 5,
          };
        }),
      });
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

  // Calculate image dimensions and position
  const getImageTransform = useCallback(() => {
    if (!imageElement || stageSize.width === 0 || stageSize.height === 0) {
      return { x: 0, y: 0, width: 0, height: 0, scale: 1, naturalWidth: 0, naturalHeight: 0 };
    }
    
    const naturalWidth = imageElement.width;
    const naturalHeight = imageElement.height;
    const containerWidth = stageSize.width;
    const containerHeight = stageSize.height;
    
    // Calculate scale to fit (object-contain)
    const scaleX = containerWidth / naturalWidth;
    const scaleY = containerHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const displayWidth = naturalWidth * scale;
    const displayHeight = naturalHeight * scale;
    
    // Center the image
    const x = (containerWidth - displayWidth) / 2;
    const y = (containerHeight - displayHeight) / 2;
    
    return { x, y, width: displayWidth, height: displayHeight, scale, naturalWidth, naturalHeight };
  }, [imageElement, stageSize]);

  // Convert stage coordinates to natural image coordinates
  const stageToNatural = useCallback((stageX: number, stageY: number) => {
    const transform = getImageTransform();
    if (!transform.scale || !transform.naturalWidth || !transform.naturalHeight) return { x: 0, y: 0 };
    
    // Image is centered at stage center
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    
    // Translate to image center
    let x = stageX - centerX;
    let y = stageY - centerY;
    
    // Apply inverse rotation
    const angleRad = (-editState.rotation * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;
    
    // Convert to natural coordinates
    x = (rotatedX / transform.scale) + transform.naturalWidth / 2;
    y = (rotatedY / transform.scale) + transform.naturalHeight / 2;
    
    return { x, y };
  }, [getImageTransform, editState.rotation, stageSize]);

  // Convert natural image coordinates to stage coordinates
  const naturalToStage = useCallback((naturalX: number, naturalY: number) => {
    const transform = getImageTransform();
    if (!transform.scale || !transform.naturalWidth || !transform.naturalHeight) return { x: 0, y: 0 };
    
    // Convert from natural to display coordinates
    let x = (naturalX - transform.naturalWidth / 2) * transform.scale;
    let y = (naturalY - transform.naturalHeight / 2) * transform.scale;
    
    // Apply rotation
    const angleRad = (editState.rotation * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;
    
    // Translate to stage center
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    
    return {
      x: rotatedX + centerX,
      y: rotatedY + centerY,
    };
  }, [getImageTransform, editState.rotation, stageSize]);

  // Handle stage mouse down
  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!imageElement) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    
    if (activeTool === 'crop') {
      const natural = stageToNatural(pointerPos.x, pointerPos.y);
      setCropStart(natural);
      setCropEnd(natural);
      setIsCropDragging(true);
    } else if (activeTool === 'arrow') {
      const natural = stageToNatural(pointerPos.x, pointerPos.y);
      setArrowStart(natural);
      setArrowEnd(natural);
      setIsArrowDragging(true);
    }
  }, [activeTool, imageElement, stageToNatural]);

  // Handle stage mouse move
  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!imageElement) return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    
    if (isCropDragging && cropStart) {
      const natural = stageToNatural(pointerPos.x, pointerPos.y);
      setCropEnd(natural);
    } else if (isArrowDragging && arrowStart) {
      const natural = stageToNatural(pointerPos.x, pointerPos.y);
      setArrowEnd(natural);
    }
  }, [imageElement, isCropDragging, isArrowDragging, cropStart, arrowStart, stageToNatural]);

  // Handle stage mouse up
  const handleStageMouseUp = useCallback(() => {
    if (isCropDragging && cropStart && cropEnd) {
      const x1 = Math.min(cropStart.x, cropEnd.x);
      const y1 = Math.min(cropStart.y, cropEnd.y);
      const x2 = Math.max(cropStart.x, cropEnd.x);
      const y2 = Math.max(cropStart.y, cropEnd.y);
      
      const width = x2 - x1;
      const height = y2 - y1;
      
      if (width > 10 && height > 10 && imageElement) {
        const naturalWidth = imageElement.width;
        const naturalHeight = imageElement.height;
        
        updateEditState({
          crop: {
            x: (x1 / naturalWidth) * 100,
            y: (y1 / naturalHeight) * 100,
            width: (width / naturalWidth) * 100,
            height: (height / naturalHeight) * 100,
          },
        });
      }
      
      setIsCropDragging(false);
      setCropStart(null);
      setCropEnd(null);
    } else if (isArrowDragging && arrowStart && arrowEnd) {
      const dx = arrowEnd.x - arrowStart.x;
      const dy = arrowEnd.y - arrowStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 10 && imageElement) {
        const naturalWidth = imageElement.width;
        const naturalHeight = imageElement.height;
        
        updateEditState({
          arrows: [
            ...editState.arrows,
            {
              id: `arrow-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              x1: (arrowStart.x / naturalWidth) * 100,
              y1: (arrowStart.y / naturalHeight) * 100,
              x2: (arrowEnd.x / naturalWidth) * 100,
              y2: (arrowEnd.y / naturalHeight) * 100,
            },
          ],
        });
      }
      
      setIsArrowDragging(false);
      setArrowStart(null);
      setArrowEnd(null);
    }
  }, [isCropDragging, isArrowDragging, cropStart, cropEnd, arrowStart, arrowEnd, imageElement, editState.arrows, updateEditState]);

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

  if (!currentImage || !imageElement) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen p-0 gap-0 translate-x-[-50%] translate-y-[-50%] left-1/2 top-1/2 rounded-none">
          <DialogTitle className="sr-only">Edit Image</DialogTitle>
          <DialogDescription className="sr-only">Image editing modal</DialogDescription>
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-slate-600">Loading image...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentIndex = allImages.findIndex(img => img.id === currentImageId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allImages.length - 1;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasChanges = editState.rotation !== 0 || editState.crop !== null || editState.arrows.length > 0;
  
  const transform = getImageTransform();
  const cursor = activeTool === 'crop' || activeTool === 'arrow' ? 'crosshair' : 'default';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen p-0 gap-0 translate-x-[-50%] translate-y-[-50%] left-1/2 top-1/2 rounded-none">
        <DialogTitle className="sr-only">Edit Image</DialogTitle>
        <DialogDescription className="sr-only">Image editing modal with rotation, crop, and arrow tools</DialogDescription>
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
                      setIsCropDragging(false);
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
            className="flex-1 relative overflow-hidden bg-slate-100"
            style={{ cursor }}
          >
            {stageSize.width > 0 && stageSize.height > 0 ? (
              <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onMouseDown={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
              >
              <Layer>
                {/* Image */}
                {imageElement && stageSize.width > 0 && stageSize.height > 0 && (
                  <Group
                    x={stageSize.width / 2}
                    y={stageSize.height / 2}
                    rotation={editState.rotation}
                  >
                    <KonvaImage
                      image={imageElement}
                      width={transform.width}
                      height={transform.height}
                      x={-transform.width / 2}
                      y={-transform.height / 2}
                    />
                  </Group>
                )}

                {/* Crop overlay (while dragging) */}
                {isCropDragging && cropStart && cropEnd && imageElement && (() => {
                  const start = naturalToStage(cropStart.x, cropStart.y);
                  const end = naturalToStage(cropEnd.x, cropEnd.y);
                  const x1 = Math.min(start.x, end.x);
                  const y1 = Math.min(start.y, end.y);
                  const x2 = Math.max(start.x, end.x);
                  const y2 = Math.max(start.y, end.y);
                  
                  return (
                    <Rect
                      x={x1}
                      y={y1}
                      width={x2 - x1}
                      height={y2 - y1}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="rgba(59, 130, 246, 0.2)"
                    />
                  );
                })()}

                {/* Crop display (saved crop) */}
                {editState.crop && !isCropDragging && imageElement && (() => {
                  const naturalWidth = imageElement.width;
                  const naturalHeight = imageElement.height;
                  const cropX = (editState.crop.x / 100) * naturalWidth;
                  const cropY = (editState.crop.y / 100) * naturalHeight;
                  const cropWidth = (editState.crop.width / 100) * naturalWidth;
                  const cropHeight = (editState.crop.height / 100) * naturalHeight;
                  
                  const topLeft = naturalToStage(cropX, cropY);
                  const bottomRight = naturalToStage(cropX + cropWidth, cropY + cropHeight);
                  
                  return (
                    <Rect
                      x={Math.min(topLeft.x, bottomRight.x)}
                      y={Math.min(topLeft.y, bottomRight.y)}
                      width={Math.abs(bottomRight.x - topLeft.x)}
                      height={Math.abs(bottomRight.y - topLeft.y)}
                      stroke="#a855f7"
                      strokeWidth={2}
                      dash={[5, 5]}
                      fill="rgba(168, 85, 247, 0.1)"
                    />
                  );
                })()}

                {/* Arrow preview (while dragging) */}
                {isArrowDragging && arrowStart && arrowEnd && imageElement && (() => {
                  const start = naturalToStage(arrowStart.x, arrowStart.y);
                  const end = naturalToStage(arrowEnd.x, arrowEnd.y);
                  
                  return (
                    <Arrow
                      points={[start.x, start.y, end.x, end.y]}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="#3b82f6"
                      pointerLength={10}
                      pointerWidth={10}
                    />
                  );
                })()}

                {/* Arrows */}
                {editState.arrows.map((arrow) => {
                  if (!imageElement) return null;
                  
                  const naturalWidth = imageElement.width;
                  const naturalHeight = imageElement.height;
                  const x1 = (arrow.x1 / 100) * naturalWidth;
                  const y1 = (arrow.y1 / 100) * naturalHeight;
                  const x2 = (arrow.x2 / 100) * naturalWidth;
                  const y2 = (arrow.y2 / 100) * naturalHeight;
                  
                  const start = naturalToStage(x1, y1);
                  const end = naturalToStage(x2, y2);
                  
                  return (
                    <Group
                      key={arrow.id}
                      onClick={() => {
                        if (activeTool === 'arrow') {
                          handleDeleteArrow(arrow.id);
                        }
                      }}
                    >
                      <Arrow
                        points={[start.x, start.y, end.x, end.y]}
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="#ef4444"
                        pointerLength={10}
                        pointerWidth={10}
                      />
                    </Group>
                  );
                })}
              </Layer>
            </Stage>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-slate-600">Initializing...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
