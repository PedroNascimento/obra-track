import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: [
      "src/tests/unit/**/*.test.ts",
      "src/tests/unit/**/*.test.tsx",
      "src/tests/integration/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/tests/",
        ".next/",
        "prisma/",
        "*.config.*",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@/domain": resolve(__dirname, "./src/domain"),
      "@/application": resolve(__dirname, "./src/application"),
      "@/infrastructure": resolve(__dirname, "./src/infrastructure"),
      "@/presentation": resolve(__dirname, "./src/presentation"),
    },
  },
});
