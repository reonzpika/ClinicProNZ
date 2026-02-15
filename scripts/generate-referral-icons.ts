/**
 * Generates placeholder PWA icons for referral-images from the SVG.
 * Run: pnpm exec tsx scripts/generate-referral-icons.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'public', 'icons', 'referral-icon.svg');
const outDir = path.join(root, 'public', 'icons');

const sizes = [192, 512, 180] as const;

async function main() {
  const svg = fs.readFileSync(svgPath);
  for (const size of sizes) {
    const outPath = path.join(outDir, `referral-icon-${size}.png`);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log('Wrote', outPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
