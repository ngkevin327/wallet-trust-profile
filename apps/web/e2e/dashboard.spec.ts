import { test, expect } from "@playwright/test";
import { mockOwnerDashboardApi } from "./helpers/mock-api";

test.describe("Dashboard score display", () => {
  test.beforeEach(async ({ page }) => {
    await mockOwnerDashboardApi(page);
  });

  test("renders reputation index and dimension cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("72")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Governance participation")).toBeVisible();
    await expect(page.getByText("DAO contribution")).toBeVisible();
    await expect(page.getByText("Active Voter")).toBeVisible();
  });

  test("opens score breakdown drawer", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /view full score breakdown/i }).click();
    await expect(page.getByRole("dialog", { name: /score breakdown/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Read methodology")).toBeVisible();
  });
});
