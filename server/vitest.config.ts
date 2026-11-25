import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/__test__/setup.ts"],
    hookTimeout: 120000,
    testTimeout: 20000,
  },
});
