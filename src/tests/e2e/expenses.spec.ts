import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

test.describe("Expenses E2E", () => {
  const testEmail = "expense.e2e@obratrack.com";
  const testPassword = "password123";
  let userId = "";

  test.beforeAll(async () => {
    // Clean up before test
    await prisma.user.deleteMany({ where: { email: testEmail } });
    
    // Create test user directly to speed up tests
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await prisma.user.create({
      data: {
        name: "Expense E2E User",
        email: testEmail,
        passwordHash: hashedPassword,
      }
    });
    userId = user.id;
  });

  test.afterAll(async () => {
    // Clean up expenses then user
    await prisma.expense.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill("input[name='email']", testEmail);
    await page.fill("input[name='password']", testPassword);
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should create a new expense and see it in the list", async ({ page }) => {
    await page.goto("/expenses");
    
    // Click 'Nova Despesa' button
    await page.click("text=Nova Despesa");
    
    // Fill the modal form
    await page.fill("input[name='description']", "Tijolos E2E");
    await page.fill("input#amount", "150,00");
    await page.fill("input[name='expenseDate']", new Date().toISOString().split('T')[0]);
    
    // Select type (assuming it's a select element or radio)
    // If it's a Radix select or standard select, we might need a specific click.
    // Assuming standard select or a generic locator for now, fallback to generic approach.
    try {
      await page.selectOption("select[name='type']", "material");
    } catch {
      // If it's a custom select, click it then click the option
      await page.click("button:has-text('Selecione')"); // Common trigger text
      await page.click("text=Material");
    }
    
    // Submit form
    await page.click("button[type='submit']");
    
    // Check if the expense appears in the table
    // Increased timeout because POST /api/expenses might be compiling in dev mode
    await expect(page.locator("table")).toContainText("Tijolos E2E", { timeout: 15000 });
  });
});
