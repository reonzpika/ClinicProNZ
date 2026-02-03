import '@testing-library/jest-dom/vitest';

import { resolve } from 'node:path';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as dotenv from 'dotenv';

// Load .env so process.env (e.g. RESEND_API_KEY) is set for tests
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Cleanup after each test
afterEach(() => {
  cleanup();
});
