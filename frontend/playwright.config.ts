import ***REMOVED*** defineConfig, devices ***REMOVED*** from '@playwright/test';

export default defineConfig(***REMOVED***
  testDir: 'tests/e2e',
  testMatch: '*.spec.ts',
  timeout: 30000,
  expect: ***REMOVED***
    timeout: 5000,
  ***REMOVED***,
  reporter: 'list',
  use: ***REMOVED***
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    headless: true,
    viewport: ***REMOVED*** width: 1280, height: 720 ***REMOVED***,
  ***REMOVED***,
  projects: [
    ***REMOVED***
      name: 'e2e',
      use: ***REMOVED*** ...devices['Desktop Chrome'] ***REMOVED***,
***REMOVED***
***REMOVED***,
***REMOVED***);