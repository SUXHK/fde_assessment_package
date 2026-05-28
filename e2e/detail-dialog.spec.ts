import { test, expect, login } from "./helpers";

test.describe("详情弹框", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });
  test("点击卡片打开详情弹框", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator('[data-testid^="work-item-card-"]').first();
    await firstCard.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8000 });
  });

  test("详情弹框显示基本信息", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator('[data-testid^="work-item-card-"]').first();
    await firstCard.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8000 });
    await expect(dialog.getByText("描述")).toBeVisible({ timeout: 5000 });
  });

  test("详情弹框可以关闭", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator('[data-testid^="work-item-card-"]').first();
    await firstCard.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8000 });

    await dialog.getByLabel("关闭").click();
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  test("最大化/还原按钮切换", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator('[data-testid^="work-item-card-"]').first();
    await firstCard.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 8000 });

    const maximizeBtn = dialog.getByLabel("最大化");
    if (await maximizeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await maximizeBtn.click();
      await expect(dialog.getByLabel("还原")).toBeVisible({ timeout: 5000 });
      await dialog.getByLabel("还原").click();
      await expect(dialog.getByLabel("最大化")).toBeVisible({ timeout: 5000 });
    }
  });
});