import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

test.describe.serial("Auth E2E", () => {
  const testEmail = "test.e2e@obratrack.com";
  const testPassword = "password123";

  test.beforeAll(async () => {
    // Ensure user doesn't exist before testing
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  test.afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  test("should register a new user successfully", async ({ page }) => {
    await page.goto("/register");
    
    await page.fill("input[name='name']", "Test E2E User");
    await page.fill("input[name='email']", testEmail);
    await page.fill("input[name='password']", testPassword);
    
    // Wait for the API response to know if it succeeded or failed
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/register') && response.request().method() === 'POST'
    );
    
    await page.click("button[type='submit']");
    
    const response = await responsePromise;
    expect(response.status()).toBe(201); // 201 Created
    
    // After successful registration, it pushes to /login which the middleware redirects to /dashboard
    // We use a longer timeout because Next.js might be compiling the dashboard page in dev mode
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("should login an existing user", async ({ page }) => {
    // First, ensure user exists (in case they run this test in isolation, the beforeAll would have deleted it)
    // Actually Playwright runs tests in workers, but within a single file they run sequentially by default.
    // Let's just go to login page, since the previous test registered the user.
    await page.goto("/login");
    
    await page.fill("input[name='email']", testEmail);
    await page.fill("input[name='password']", testPassword);
    
    await page.click("button[type='submit']");
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
  });

  test("should show error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    
    await page.fill("input[name='email']", "wrong@email.com");
    await page.fill("input[name='password']", "wrongpass");
    
    await page.click("button[type='submit']");
    
    // Should show error message (assuming the UI renders an element with text "Credenciais inválidas" or similar)
    await expect(page.locator("text=Credenciais inválidas").or(page.locator("text=Erro ao fazer login"))).toBeVisible();
  });
});
