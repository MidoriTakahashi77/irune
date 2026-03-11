import { defineConfig } from "@playwright/test";
import { readFileSync, existsSync } from "fs";

// Load .env.e2e and .env into process.env
for (const envFile of [".env", ".env.e2e"]) {
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx);
        const value = trimmed.slice(eqIdx + 1);
        process.env[key] = value;
      }
    }
  }
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: "http://localhost:8081",
    locale: "ja-JP",
    viewport: { width: 1280, height: 1200 },
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npx expo start --web --port 8081",
    port: 8081,
    timeout: 60000,
    reuseExistingServer: true,
  },
});
