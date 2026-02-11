import { beforeEach, describe, expect, it, vi } from 'vitest';

import { triggerFileDownload } from '../triggerFileDownload';

describe('triggerFileDownload', () => {
  const mockClick = vi.fn();
  const mockAppendChild = vi.fn();
  const mockRemoveChild = vi.fn();
  const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
  const mockRevokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockLink as unknown as HTMLAnchorElement;
      }
      return document.createElement(tagName);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    mockClick.mockClear();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
  });

  it('fetches url, creates blob link, triggers download, and revokes URL', async () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    });

    const result = await triggerFileDownload('https://example.com/image.jpg', 'photo.jpg');

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/image.jpg', { mode: 'cors' });
    expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  it('returns false when fetch response is not ok', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    });

    const result = await triggerFileDownload('https://example.com/bad', 'file.jpg');

    expect(result).toBe(false);
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockRevokeObjectURL).not.toHaveBeenCalled();
  });

  it('returns false when fetch throws', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const result = await triggerFileDownload('https://example.com/fail', 'file.jpg');

    expect(result).toBe(false);
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
  });
});
