export async function computeClientHash(file: File): Promise<string> {
  try {
    const chunk = file.slice(0, 128 * 1024);
    const buf = await chunk.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-1', buf);
    const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${file.size}-${file.lastModified}-${hex}`;
  } catch {
    return `${file.size}-${file.lastModified}`;
  }
}
