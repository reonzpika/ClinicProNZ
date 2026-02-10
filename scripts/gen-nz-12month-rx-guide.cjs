/**
 * Generates nz-12month-rx-guide.ts from markdown sources
 *
 * Input:  app/(clinical)/12-month-prescriptions/*.md
 * Output: src/features/12-month-prescriptions/lib/nz-12month-rx-guide.ts
 *
 * Run: node scripts/gen-nz-12month-rx-guide.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const base = path.join(repoRoot, 'app', '(clinical)', '12-month-prescriptions');
const guidePath = path.join(base, '12Month_Rx_GP_Guide_REVISED.md');
const sourcePath = path.join(base, 'Source_Authority_Quick_Guide.md');
const outPath = path.join(repoRoot, 'src', 'features', '12-month-prescriptions', 'lib', 'nz-12month-rx-guide.ts');

const guide = fs.readFileSync(guidePath, 'utf-8');
const source = fs.readFileSync(sourcePath, 'utf-8');
const combined = `${guide.trimEnd()}\n\n---\n\n${source.trim()}`;

const escaped = combined
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const tsContent
  = `// Combined from 12Month_Rx_GP_Guide_REVISED.md + Source_Authority_Quick_Guide.md\n`
    + `export const NZ_12MONTH_RX_GUIDE: string = \`${
   escaped
   }\`;\n`;

fs.writeFileSync(outPath, tsContent);
console.log('Generated nz-12month-rx-guide.ts');
