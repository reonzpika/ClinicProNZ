'use client';

export function LiveTranscript({
  final,
  interim,
}: {
  final: string;
  interim: string;
}) {
  return (
    <div className="space-y-2 text-sm">
      {final && (
        <div className="rounded-md bg-muted/30 p-3 text-foreground">
          {final}
        </div>
      )}
      {interim && (
        <div className="rounded-md border border-dashed p-3 italic text-muted-foreground">
          {interim}
        </div>
      )}
    </div>
  );
}
