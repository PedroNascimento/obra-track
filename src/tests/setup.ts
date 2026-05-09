import "@testing-library/jest-dom";
import { vi } from "vitest";

// Optional: Mock next/navigation or other Next.js specific globals if needed for components
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    };
  },
  usePathname() {
    return "";
  },
}));
