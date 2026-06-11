import { expect, test } from "@playwright/test";

test("shows the Shoesoco intro and balanced hero categories", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("site-intro")).toBeVisible();
  const continueButton = page.getByRole("button", {
    name: "Continue to Shoesoco",
  });
  await expect(continueButton).toBeEnabled({ timeout: 3000 });
  await continueButton.click();
  await expect(page.getByTestId("site-intro")).toHaveCount(0, { timeout: 2000 });
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem("shoesoco-intro-seen")))
    .toBe("true");
  await expect(page.getByText("SHOESOCO").first()).toBeVisible();

  const sneakerTab = page.getByRole("button", { name: "Show Sneakers shoe" });
  const runningTab = page.getByRole("button", { name: "Show Running shoe" });
  await expect(sneakerTab).toHaveAttribute("aria-pressed", "true");
  await runningTab.click();
  await expect(runningTab).toHaveAttribute("aria-pressed", "true");
});

test("filters products and opens quick preview", async ({ page }) => {
  await page.goto("/products");
  await page.getByPlaceholder("Search products, colors, or collections").fill("runner");
  await expect(page.getByText(/product/).first()).toBeVisible();
  const card = page.locator("article").first();
  await card.hover();
  await card.getByRole("button", { name: "Quick view" }).click();
  await expect(page.getByRole("dialog", { name: "Quick preview" })).toBeVisible();
});

test("adds a product and opens the mini cart", async ({ page }) => {
  await page.goto("/products");
  await page.locator("article a").first().click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("dialog", { name: "Added to your rotation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View cart" })).toBeVisible();
});

test("shows the complete guest order form in the cart", async ({ page }) => {
  await page.goto("/products");
  await page.locator("article a").first().click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "View cart" }).click();

  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Phone number")).toBeVisible();
  await expect(page.getByLabel("Delivery area")).toBeVisible();
  await expect(page.getByLabel("Full delivery address")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Save order and continue to WhatsApp",
    }),
  ).toBeDisabled();
});
