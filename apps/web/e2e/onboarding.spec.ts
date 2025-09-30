import { test, expect } from "@playwright/test";

test.describe("Onboarding happy path", () => {
  test.beforeEach(() => {
    test.skip(!process.env.NEXT_PUBLIC_TEST_MODE, "Requires NEXT_PUBLIC_TEST_MODE=true");
  });

  test("landing shows connect CTA and how-it-works link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /professional reputation/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /how it works/i })).toBeVisible();
  });

  test("dashboard route accessible in test mode", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/reputation index|loading dashboard/i)).toBeVisible();
  });
});
