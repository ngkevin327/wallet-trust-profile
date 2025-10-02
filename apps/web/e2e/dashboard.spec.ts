import { test, expect } from "@playwright/test";
import profileFixture from "./fixtures/profile-ready.json";

test.describe("Dashboard score display", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/me/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(profileFixture),
      });
    });
    await page.route("**/v1/me/scores/breakdown", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          scoringVersion: "1.0.0",
          reputationIndex: 72,
          inputsHash: "abc123",
          snapshotId: "snap-1",
          createdAt: new Date().toISOString(),
          dimensions: [
            { key: "governance", score: 65, weight: 0.25, factors: [] },
            { key: "contribution", score: 80, weight: 0.3, factors: [] },
          ],
        }),
      });
    });
  });

  test("renders reputation index and dimension cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("72")).toBeVisible();
    await expect(page.getByText("Governance")).toBeVisible();
    await expect(page.getByText("Contribution")).toBeVisible();
    await expect(page.getByText("Active Voter")).toBeVisible();
  });

  test("opens score breakdown drawer", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /view full score breakdown/i }).click();
    await expect(page.getByRole("dialog", { name: /score breakdown/i })).toBeVisible();
    await expect(page.getByText("Read methodology")).toBeVisible();
  });
});
