/**
 * One-off migration: parses TRAFFIC_LIGHT_CONTENT markdown and emits
 * traffic-light-data.ts with structured TRAFFIC_LIGHT_DOCUMENT.
 *
 * Run from repo root: npx tsx scripts/migrate-traffic-light-to-structured.ts
 */
import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const checkerPath = path.join(
  repoRoot,
  'src',
  'features',
  '12-month-prescriptions',
  'lib',
  'traffic-light-checker.ts'
);
const raw = fs.readFileSync(checkerPath, 'utf-8');
const match = raw.match(/export const TRAFFIC_LIGHT_CONTENT: string = `([\s\S]*?)`;/m);
if (!match) throw new Error('Could not extract TRAFFIC_LIGHT_CONTENT from checker file');
const md = match[1].trim();

function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/\//g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseTable(segment: string): { headers: string[]; rows: string[][] } | null {
  const lines = segment.split('\n').filter((l) => l.includes('|'));
  if (lines.length < 2) return null;
  const parseRow = (line: string) =>
    line
      .split('|')
      .map((c) => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);
  const headers = parseRow(lines[0]);
  const sep = lines[1];
  const isSeparator = /^[\s|\-]+$/.test(sep);
  const dataLines = isSeparator ? lines.slice(2) : lines.slice(1);
  const rows = dataLines.map(parseRow);
  if (rows.some((r) => r.length !== headers.length)) return null;
  return { headers, rows };
}

function classifySegment(segment: string): 'table' | 'list' | 'hr' | 'paragraph' {
  const t = segment.trim();
  if (!t) return 'hr';
  if (/^---+$/.test(t) || t === '---') return 'hr';
  const lines = t.split('\n');
  if (lines.some((l) => l.includes('|'))) return 'table';
  if (lines[0].trimStart().startsWith('-')) return 'list';
  return 'paragraph';
}

type Block =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'subsection'; id?: string; title: string; subtitle?: string; blocks: Block[] }
  | { type: 'hr' };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const segments = content.split(/\n---+\s*\n/).map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    const kind = classifySegment(seg);
    if (kind === 'hr') {
      blocks.push({ type: 'hr' });
      continue;
    }
    if (kind === 'table') {
      const t = parseTable(seg);
      if (t) blocks.push({ type: 'table', headers: t.headers, rows: t.rows });
      else blocks.push({ type: 'paragraph', content: seg });
      continue;
    }
    if (kind === 'list') {
      blocks.push({ type: 'list', content: seg });
      continue;
    }
    blocks.push({ type: 'paragraph', content: seg });
  }
  return blocks;
}

function parseSubsections(content: string): Block[] {
  const parts = content.split(/\n### /);
  const result: Block[] = [];
  const first = parts[0].trim();
  if (first) {
    const topBlocks = parseBlocks(first);
    result.push(...topBlocks);
  }
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const lineEnd = chunk.indexOf('\n');
    const firstLine = lineEnd >= 0 ? chunk.slice(0, lineEnd) : chunk;
    const rest = lineEnd >= 0 ? chunk.slice(lineEnd + 1) : '';
    let title = firstLine.trim();
    let subtitle: string | undefined;
    let body = rest;
    const subMatch = rest.match(/^\s*\*\(([^)]*)\)\*\s*\n?/);
    if (subMatch) {
      subtitle = subMatch[1];
      body = rest.slice(subMatch[0].length);
    }
    const id = slugify(title) || undefined;
    const blocks = parseBlocks(body);
    result.push({ type: 'subsection', id, title, subtitle, blocks });
  }
  return result;
}

type Section = { id?: string; title: string; zone?: 'green' | 'amber' | 'red'; blocks: Block[] };

const sections: Section[] = [];
const sectionSplits = md.split(/\n## /).filter(Boolean);
let amberCount = 0;
for (let i = 0; i < sectionSplits.length; i++) {
  const chunk = sectionSplits[i];
  const firstNewline = chunk.indexOf('\n');
  const titleLine = firstNewline >= 0 ? chunk.slice(0, firstNewline).trim() : chunk.trim();
  const body = firstNewline >= 0 ? chunk.slice(firstNewline + 1) : '';
  if (!titleLine) continue;
  if (i === 0 && !titleLine.startsWith('🟢') && !titleLine.startsWith('🟡') && !titleLine.startsWith('🔴')) {
    continue;
  }
  let id: string | undefined;
  let zone: 'green' | 'amber' | 'red' | undefined;
  if (/GREEN/i.test(titleLine)) {
    id = 'green-zone';
    zone = 'green';
  } else if (/AMBER/i.test(titleLine)) {
    amberCount++;
    id = amberCount === 1 ? 'amber-zone' : 'amber-zone-detail';
    zone = 'amber';
  } else if (/RED/i.test(titleLine)) {
    id = 'red-zone';
    zone = 'red';
  }
  const blocks = parseSubsections(body);
  sections.push({ id, title: titleLine, zone, blocks });
}

const updatedMatch = md.match(/\*\*Updated\s+([^*]+)\*\*/);
const updated = updatedMatch ? updatedMatch[1].trim() : undefined;
const document = { updated, sections };

function escapeForTs(s: string): string {
  return JSON.stringify(s);
}

function emitBlock(b: Block): string {
  switch (b.type) {
    case 'paragraph':
      return `{ type: 'paragraph', content: ${escapeForTs(b.content)} }`;
    case 'list':
      return `{ type: 'list', content: ${escapeForTs(b.content)} }`;
    case 'table':
      return `{ type: 'table', headers: [${b.headers.map(escapeForTs).join(', ')}], rows: [${b.rows.map((r) => `[${r.map(escapeForTs).join(', ')}]`).join(', ')}] }`;
    case 'hr':
      return `{ type: 'hr' }`;
    case 'subsection':
      return `{ type: 'subsection', id: ${b.id ? escapeForTs(b.id) : 'undefined'}, title: ${escapeForTs(b.title)}${b.subtitle ? `, subtitle: ${escapeForTs(b.subtitle)}` : ''}, blocks: [${b.blocks.map(emitBlock).join(',\n    ')}] }`;
  }
}

function emitSection(s: Section): string {
  const idStr = s.id ? `id: ${escapeForTs(s.id)}, ` : '';
  const zoneStr = s.zone ? `zone: '${s.zone}', ` : '';
  return `{ ${idStr}${zoneStr}title: ${escapeForTs(s.title)}, blocks: [\n    ${s.blocks.map(emitBlock).join(',\n    ')}\n  ] }`;
}

const outTs = `/**
 * Structured Traffic Light Medication Checker content.
 * Generated by scripts/migrate-traffic-light-to-structured.ts
 */
import type { TrafficLightDocument } from './traffic-light-types';

export const TRAFFIC_LIGHT_DOCUMENT: TrafficLightDocument = {
  updated: ${updated ? escapeForTs(updated) : 'undefined'},
  sections: [
${sections.map((s) => '  ' + emitSection(s)).join(',\n')}
  ],
};
`;

const outPath = path.join(
  repoRoot,
  'src',
  'features',
  '12-month-prescriptions',
  'lib',
  'traffic-light-data.ts'
);
fs.writeFileSync(outPath, outTs, 'utf-8');
console.log('Wrote', outPath);
console.log('Sections:', sections.length);
console.log('Total blocks in first section:', sections[0]?.blocks.length);
process.exit(0);
