import { expect, test } from "@playwright/test";

test("login page renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
});

test("registration and login flow", async ({ page }) => {
  const unique = Date.now();
  await page.goto("/register");
  await page.getByLabel(/full name/i).fill("Playwright User");
  await page.getByLabel(/email/i).fill(`pw${unique}@example.com`);
  await page.getByLabel(/phone/i).fill("1234567890");
  await page.getByLabel(/^password$/i).fill("PlaywrightPass123");
  await page.getByLabel(/confirm password/i).fill("PlaywrightPass123");
  await page.getByRole("button", { name: /register/i }).click();

  await page.waitForURL(/\/dashboard/);
  await expect(page.getByText(/customer dashboard/i)).toBeVisible();
});
