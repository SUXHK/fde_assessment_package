import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export const test = base;

const TEST_EMAIL = "e2e@test.com";
const TEST_PASSWORD = "e2epass123";

export async function login(page: Page) {
  // Navigate to register
  await page.goto("/register");
  await page.waitForLoadState("networkidle");

  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("您的名称").fill("E2E Tester");
  await page.locator('input[placeholder="至少 6 位密码"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /注册/ }).click();

  // Wait for verification step — use proper condition, not fixed timeout
  const verifyBtn = page.getByRole("button", { name: /验证并进入/ });
  try {
    await verifyBtn.waitFor({ state: "visible", timeout: 8000 });
    // Code is auto-filled by the API response
    await verifyBtn.click();
  } catch {
    // User already exists (parallel worker or re-run), fall back to login
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.locator('input[placeholder="您的密码"]').fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /登录/ }).click();
  }

  // Both flows use window.location.href, wait for the full-page redirect to home
  await page.waitForURL((url) => url.pathname === "/" || url.pathname === "", { timeout: 15000 });
  await page.waitForLoadState("networkidle");
}

export async function openBoard(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId(/^work-item-card-/).first()).toBeVisible({ timeout: 15000 });
}

export async function openDetailDialog(page: Page, cardIndex = 0) {
  const cards = page.getByTestId(/^work-item-card-/);
  await cards.nth(cardIndex).click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
  return page.getByRole("dialog");
}

export async function closeDialog(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("关闭").click();
  await expect(dialog).not.toBeVisible();
}

export { expect };
