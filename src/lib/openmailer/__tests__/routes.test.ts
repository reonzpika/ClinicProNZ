/**
 * API route handler tests for OpenMailer (track open/click, subscribers).
 * Mocks database/client so no real DB is required.
 */

import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDb = vi.fn();
vi.mock('database/client', () => ({ getDb: mockGetDb }));

function createChainableSelect(resolvedValue: unknown[]) {
  const limit = vi.fn().mockResolvedValue(resolvedValue);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  const select = vi.fn().mockReturnValue({ from });
  return { select, from, where, limit };
}

function createChainableUpdate() {
  const where = vi.fn().mockResolvedValue(undefined);
  const set = vi.fn().mockReturnValue({ where });
  const update = vi.fn().mockReturnValue({ set });
  return { update, set, where };
}

describe('GET /api/openmailer/track/open', () => {
  beforeEach(() => {
    mockGetDb.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and image/gif with pixel when c and s are present and DB updates', async () => {
    const selectChain = createChainableSelect([
      {
        id: 'em1',
        campaignId: 'c1',
        subscriberId: 's1',
        openedAt: null,
      },
    ]);
    const updateChain1 = createChainableUpdate();
    const updateChain2 = createChainableUpdate();
    const updateCalls: ReturnType<typeof createChainableUpdate>[] = [
      updateChain1,
      updateChain2,
    ];
    let updateCallIndex = 0;
    const updateFn = vi.fn().mockImplementation(() =>
      updateCalls[updateCallIndex++].update()
    );
    mockGetDb.mockReturnValue({
      select: selectChain.select,
      update: updateFn,
    });

    const { GET } = await import('@/app/api/openmailer/track/open/route');
    const url = 'http://localhost/api/openmailer/track/open?c=c1&s=s1';
    const req = new NextRequest(url);
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    expect(mockGetDb).toHaveBeenCalled();
  });

  it('returns 200 and GIF when c or s is missing (no DB update)', async () => {
    mockGetDb.mockClear();

    const { GET } = await import('@/app/api/openmailer/track/open/route');
    const req = new NextRequest(
      'http://localhost/api/openmailer/track/open?c=c1'
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/gif');
    expect(mockGetDb).not.toHaveBeenCalled();
  });
});

describe('GET /api/openmailer/track/click/[shortCode]', () => {
  const targetUrl = 'https://example.com/page';

  beforeEach(() => {
    mockGetDb.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to link url and records click when s is present', async () => {
    const linkRow = {
      id: 'link1',
      campaignId: 'camp1',
      url: targetUrl,
      shortCode: 'abc',
    };
    const emailRow = {
      id: 'em1',
      campaignId: 'camp1',
      subscriberId: 'sub1',
      clickedAt: null,
    };
    const selectLimit = vi
      .fn()
      .mockResolvedValueOnce([linkRow])
      .mockResolvedValueOnce([emailRow]);
    const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit });
    const selectFrom = vi.fn().mockReturnValue({ where: selectWhere });
    const select = vi.fn().mockReturnValue({ from: selectFrom });
    const updateWhere = vi.fn().mockResolvedValue(undefined);
    const updateSet = vi.fn().mockReturnValue({ where: updateWhere });
    const update = vi.fn().mockReturnValue({ set: updateSet });
    const insertValues = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{}]),
    });
    const insert = vi.fn().mockReturnValue({ values: insertValues });

    mockGetDb.mockReturnValue({
      select,
      from: selectFrom,
      where: selectWhere,
      update,
      insert,
    });

    const { GET } = await import(
      '@/app/api/openmailer/track/click/[shortCode]/route'
    );
    const req = new NextRequest(
      `http://localhost/api/openmailer/track/click/abc?s=sub1`
    );
    const res = await GET(req, {
      params: Promise.resolve({ shortCode: 'abc' }),
    });

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(targetUrl);
    expect(insert).toHaveBeenCalled();
  });

  it('redirects to link url when s is absent (no click record)', async () => {
    const linkRow = {
      id: 'link1',
      campaignId: 'camp1',
      url: targetUrl,
      shortCode: 'xyz',
    };
    const selectLimit = vi.fn().mockResolvedValue([linkRow]);
    const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit });
    const selectFrom = vi.fn().mockReturnValue({ where: selectWhere });
    const select = vi.fn().mockReturnValue({ from: selectFrom });
    mockGetDb.mockReturnValue({
      select,
      from: selectFrom,
      where: selectWhere,
      update: vi.fn(),
      insert: vi.fn(),
    });

    const { GET } = await import(
      '@/app/api/openmailer/track/click/[shortCode]/route'
    );
    const req = new NextRequest(
      'http://localhost/api/openmailer/track/click/xyz'
    );
    const res = await GET(req, {
      params: Promise.resolve({ shortCode: 'xyz' }),
    });

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(targetUrl);
  });
});

describe('POST /api/openmailer/subscribers', () => {
  beforeEach(() => {
    mockGetDb.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when auth header is not admin', async () => {
    const { POST } = await import('@/app/api/openmailer/subscribers/route');
    const req = new NextRequest(
      'http://localhost/api/openmailer/subscribers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test',
          listName: 'pho-contacts',
        }),
      }
    );
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockGetDb).not.toHaveBeenCalled();
  });

  it('returns 200 and subscriber when x-user-tier is admin and body is valid', async () => {
    const created = {
      id: 'sub1',
      email: 'new@example.com',
      name: 'New User',
      listName: 'pho-contacts',
      status: 'active',
      source: 'manual',
      subscribedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const selectLimit = vi.fn().mockResolvedValue([]);
    const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit });
    const selectFrom = vi.fn().mockReturnValue({ where: selectWhere });
    const select = vi.fn().mockReturnValue({ from: selectFrom });
    const insertValues = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([created]),
    });
    const insert = vi.fn().mockReturnValue({ values: insertValues });

    mockGetDb.mockReturnValue({
      select,
      from: selectFrom,
      where: selectWhere,
      insert,
    });

    const { POST } = await import('@/app/api/openmailer/subscribers/route');
    const req = new NextRequest(
      'http://localhost/api/openmailer/subscribers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-tier': 'admin',
        },
        body: JSON.stringify({
          email: 'new@example.com',
          name: 'New User',
          listName: 'pho-contacts',
        }),
      }
    );
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toMatchObject({
      email: 'new@example.com',
      name: 'New User',
      listName: 'pho-contacts',
    });
  });
});

describe('GET /api/openmailer/subscribers', () => {
  beforeEach(() => {
    mockGetDb.mockReset();
  });

  it('returns 401 when not authorised', async () => {
    const { GET } = await import('@/app/api/openmailer/subscribers/route');
    const req = new NextRequest('http://localhost/api/openmailer/subscribers');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
