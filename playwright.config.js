const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  use: {
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npx http-server ./s4',
    port: 5500,
    reuseExistingServer: true,
  },
});
