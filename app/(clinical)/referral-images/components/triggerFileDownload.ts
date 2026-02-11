/**
 * Fetch a URL as blob and trigger a file download.
 * Avoids browser opening the URL in a new tab (e.g. for cross-origin presigned URLs).
 */
export async function triggerFileDownload(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) {
      return false;
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    return false;
  }
}
