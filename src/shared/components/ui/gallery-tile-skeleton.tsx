'use client';

export function GalleryTileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-lg bg-slate-200" />
      <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
    </div>
  );
}
