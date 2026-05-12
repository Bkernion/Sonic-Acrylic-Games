import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /[^._][^/]*\.spec\.ts$/,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "iphone",
      use: {
        ...devices["iPhone 13"],
        // Override to chromium since only chromium is installed (not webkit)
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: "rm -rf .next/dev 2>/dev/null; npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 90_000,
  },
});
