import type { Page } from "@playwright/test";
import profileFixture from "../fixtures/profile-ready.json";

/** Deterministic API mocks for PR CI (no live backend required). */
export async function mockOwnerDashboardApi(page: Page) {
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

  await page.route("**/v1/billing/subscription", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ plan: "free", upgradeUrl: "/pricing" }),
    });
  });
}

export async function mockPublicProfileApi(page: Page, slug = "demo-builder") {
  await page.route(`**/v1/profiles/${slug}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        slug,
        displayName: "Demo Builder",
        visibility: "public",
        status: "active",
        reputationIndex: 72,
        dimensions: profileFixture.dimensions,
        badges: profileFixture.badges,
        trustSignals: [],
        scoringVersion: "1.0.0",
        lastUpdated: profileFixture.lastUpdated,
      }),
    });
  });
}
