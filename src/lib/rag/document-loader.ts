import { Document } from 'llamaindex';
import fs from 'fs/promises';
import path from 'path';

/**
 * Reads Healthify crawl outputs from the `data` directory and converts them into LlamaIndex Documents.
 * Expected per-file JSON shape from crawl4ai:
 * {
 *   "url": "https://healthify.nz/...",
 *   "title": "Page Title",
 *   "markdown": "# Content here...",
 *   "metadata": { ... }
 * }
 */
export default async function parseHealthifyData(): Promise<Document[]> {
  const dataDir = path.resolve(process.cwd(), 'data');

  let filePaths: string[] = [];
  try {
    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    filePaths = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
      .map((entry) => path.join(dataDir, entry.name));
  } catch (error: any) {
    if (error && error.code === 'ENOENT') {
      console.warn(`[Healthify] Data directory not found at ${dataDir}. Returning 0 documents.`);
      return [];
    }
    console.error(`[Healthify] Failed to read data directory at ${dataDir}:`, error);
    return [];
  }

  console.log(`[Healthify] Found ${filePaths.length} files in ${dataDir}`);

  const results = await Promise.all(
    filePaths.map(async (filePath): Promise<Document | null> => {
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw);

        const url: string | undefined = typeof parsed?.url === 'string' ? parsed.url : undefined;
        const title: string | undefined = typeof parsed?.title === 'string' ? parsed.title : undefined;

        const markdown: string | undefined =
          typeof parsed?.markdown === 'string' && parsed.markdown.trim().length > 0
            ? parsed.markdown
            : undefined;
        const content: string | undefined = typeof parsed?.content === 'string' ? parsed.content : undefined;
        const text: string | undefined = markdown ?? content;

        if (!text) {
          console.warn(
            `[Healthify] Skipping ${path.basename(filePath)}: missing 'markdown' or 'content' fields.`
          );
          return null;
        }

        const sourceMetadata = (parsed?.metadata && typeof parsed.metadata === 'object') ? parsed.metadata : {};

        // Determine date: prefer crawled date fields if available; fallback to now
        const candidateDates: Array<unknown> = [
          (sourceMetadata as any)?.crawledAt,
          (sourceMetadata as any)?.crawled_at,
          (sourceMetadata as any)?.crawlDate,
          (sourceMetadata as any)?.lastModified,
          (sourceMetadata as any)?.date,
        ].filter(Boolean);

        let dateIso: string | undefined;
        if (candidateDates.length > 0) {
          const d = new Date(String(candidateDates[0]));
          dateIso = isNaN(d.getTime()) ? undefined : d.toISOString();
        }
        if (!dateIso) {
          dateIso = new Date().toISOString();
        }

        const doc = new Document({
          text,
          metadata: {
            ...(sourceMetadata as Record<string, unknown>),
            url: url ?? null,
            title: title ?? null,
            source: 'healthify',
            date: dateIso,
          },
        }) as unknown as Document;

        return doc;
      } catch (err: any) {
        // Handle file read or JSON parse issues gracefully
        const message = err?.message ?? String(err);
        console.warn(`[Healthify] Skipping ${path.basename(filePath)} due to error: ${message}`);
        return null;
      }
    })
  );

  const documents: Document[] = results.filter((d): d is Document => d !== null);
  console.log(`[Healthify] Loaded ${documents.length}/${filePaths.length} documents from Healthify`);
  return documents;
}

