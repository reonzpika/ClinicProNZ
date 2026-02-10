/**
 * Generates traffic-light-checker.ts from markdown source
 *
 * Input:  app/(clinical)/12-month-prescriptions/Traffic_Light_Medication_Checker.md
 * Output: src/features/12-month-prescriptions/lib/traffic-light-checker.ts
 *
 * Run: npx tsx scripts/gen-traffic-light-checker.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const mdPath = path.join(
  repoRoot,
  'app',
  '(clinical)',
  '12-month-prescriptions',
  'Traffic_Light_Medication_Checker.md',
);
const content = fs.readFileSync(mdPath, 'utf-8');
const escaped = content
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');
const tsPath = path.join(
  repoRoot,
  'src',
  'features',
  '12-month-prescriptions',
  'lib',
  'traffic-light-checker.ts',
);
const tsContent = `// Content from Traffic_Light_Medication_Checker.md\nexport const TRAFFIC_LIGHT_CONTENT: string = \`${escaped}\`;\n`;
fs.writeFileSync(tsPath, tsContent);
console.log('Generated traffic-light-checker.ts');
