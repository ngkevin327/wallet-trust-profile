import { test, expect } from "@playwright/test";

test.describe("Public profile viewing", () => {
  test("renders public slug with score, badges, and visitor CTA", async ({ page }) => {
    await page.goto("/u/demo-builder");
    await expect(page.getByRole("heading", { name: /demo builder/i })).toBeVisible();
    await expect(page.getByText("72")).toBeVisible();
    await expect(page.getByText("Governance participation")).toBeVisible();
    await expect(page.getByText("Active Voter")).toBeVisible();
    await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
    await expect(page.getByText(/scoring v1\.0\.0/i)).toBeVisible();
  });

  test("shows not found for private slug fixture", async ({ page }) => {
    await page.goto("/u/private-demo");
    await expect(page.getByRole("heading", { name: /profile not found/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /connect wallet/i })).toBeVisible();
  });

  test("returns friendly 404 for malformed slug before API", async ({ page }) => {
    await page.goto("/u/INVALID!!slug");
    await expect(page.getByRole("heading", { name: /profile not found/i })).toBeVisible();
  });

  test("public trust panel hides high severity until expanded", async ({ page }) => {
    await page.goto("/u/demo-builder");
    await expect(page.getByText("Consistent voter")).toBeVisible();
    await expect(page.getByText("Elevated risk pattern")).not.toBeVisible();
    await page.getByRole("button", { name: /view details/i }).click();
    await expect(page.getByText("Elevated risk pattern")).toBeVisible();
  });
});
