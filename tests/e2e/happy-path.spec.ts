import { test, expect } from "@playwright/test";

test.describe("Sonic Acrylic Games happy path", () => {
  test("home renders today's lineup + 6 game cards", async ({ page }) => {
    await page.goto("/");

    // The hero may render either the seeded headline ("Tonight's table of five.")
    // or the "New edition drops at midnight ET" fallback if no puzzle is seeded for today.
    // Both are valid states. We just verify the page boots and shows the game list.
    await expect(page.getByText("TODAY'S SIX")).toBeVisible();
    await expect(page.getByText("Sixteen songs from tonight's five")).toBeVisible();
    await expect(page.getByText("SPELL", { exact: false })).toBeVisible();
    await expect(page.getByText("INFLUENCE", { exact: false })).toBeVisible();
  });

  test("connections page loads with 16 tiles", async ({ page }) => {
    await page.goto("/connections");

    await expect(page.getByText("CONNECTIONS · 1 OF 6")).toBeVisible();
    await expect(page.getByText("Sixteen songs.")).toBeVisible({ timeout: 8000 });

    // Wait for the 4x4 grid (16 tile buttons) to appear
    // We locate by the grid wrapper: it has classes "grid grid-cols-4 gap-[6px]"
    const tiles = page.locator(".grid.grid-cols-4 button");
    await expect(tiles).toHaveCount(16, { timeout: 8000 });
  });

  test("can select 4 tiles, submit, and get a server response", async ({ page }) => {
    let checkResponse: { result: string } | null = null;
    page.on("response", async (res) => {
      if (res.url().includes("/api/connections/check") && res.request().method() === "POST") {
        checkResponse = await res.json().catch(() => null);
      }
    });

    await page.goto("/connections");
    const tiles = page.locator(".grid.grid-cols-4 button");
    await expect(tiles).toHaveCount(16, { timeout: 8000 });

    // Click first 4 tiles
    for (let i = 0; i < 4; i++) {
      await tiles.nth(i).click();
    }

    // Submit button is the third in the action row, with text "Submit"
    await page.getByRole("button", { name: /^submit$/i }).click();

    // Wait for the network round-trip
    await expect.poll(() => checkResponse, { timeout: 6000 }).not.toBeNull();
    expect(["match", "one_away", "wrong", "invalid"]).toContain(checkResponse!.result);
  });

  test("email capture POSTs successfully", async ({ page }) => {
    // Hit the capture API directly (faster, doesn't require winning)
    const response = await page.request.post("/api/capture", {
      data: { email: `playwright-test-${Date.now()}@example.com`, source: "e2e" },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});
