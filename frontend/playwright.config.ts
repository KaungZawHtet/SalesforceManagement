import ***REMOVED*** defineConfig, devices ***REMOVED*** from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT ?? '3001';
const baseURL = `http://127.0.0.1:$***REMOVED***port***REMOVED***`;

export default defineConfig(***REMOVED***
  testDir: 'tests/e2e',
  testMatch: '*.spec.ts',
  timeout: 30000,
  expect: ***REMOVED***
    timeout: 5000,
  ***REMOVED***,
  reporter: 'list',
  use: ***REMOVED***
    baseURL,
    trace: 'on-first-retry',
    headless: true,
    viewport: ***REMOVED*** width: 1280, height: 720 ***REMOVED***,
  ***REMOVED***,
  webServer: ***REMOVED***
    command: `npm run dev -- --hostname 127.0.0.1 --port $***REMOVED***port***REMOVED***`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: ***REMOVED***
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3000',
***REMOVED***
  ***REMOVED***,
  projects: [
    ***REMOVED***
      name: 'e2e',
      use: ***REMOVED*** ...devices['Desktop Chrome'] ***REMOVED***,
***REMOVED***
***REMOVED***,
***REMOVED***);
