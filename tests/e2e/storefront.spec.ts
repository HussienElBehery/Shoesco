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

  const sneakerTab = page.getByRole("button", {
    name: "Show Sneakers representative shoe",
  });
  const runningTab = page.getByRole("button", {
    name: "Show Running representative shoe",
  });
  await sneakerTab.click();
  await expect(sneakerTab).toHaveAttribute("aria-pressed", "true");
  await runningTab.click();
  await expect(runningTab).toHaveAttribute("aria-pressed", "true");
});

test("filters products and opens quick preview", async ({ page }) => {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  const search = page.getByPlaceholder("Search products, colors, or collections");
  await expect(search).toBeEnabled({ timeout: 15000 });
  await search.fill("runner");
  await expect(page.locator("main article")).toHaveCount(1);
  const card = page.locator("article").first();
  await card.hover();
  await card.getByRole("button", { name: "Quick view" }).click();
  await expect(page.getByRole("dialog", { name: "Quick preview" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Quick preview" })).toHaveCount(0);
  await expect(card.getByRole("button", { name: "Quick view" })).toBeFocused();
});

test("core storefront pages do not overflow horizontally", async ({ page }) => {
  test.setTimeout(60000);
  for (const path of ["/", "/products", "/about", "/contact", "/cart"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const intro = page.getByTestId("site-intro");
    if (await intro.isVisible().catch(() => false)) {
      await page.getByRole("button", { name: "Continue to Shoesoco" }).click();
    }
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(
      dimensions.clientWidth + 1,
    );
  }
});

test("adds a product and opens the mini cart", async ({ page }) => {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  const href = await page
    .locator("main article")
    .first()
    .getByRole("link", { name: "Discover this pair" })
    .getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(href!);
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("dialog", { name: "Added to your rotation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View cart" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        local: localStorage.getItem("shoesoco-cart-v2"),
        session: sessionStorage.getItem("shoesoco-cart-v2"),
      })),
    )
    .toMatchObject({ local: null });
});

test("shows the complete guest order form in the cart", async ({ page }) => {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  const href = await page
    .locator("main article")
    .first()
    .getByRole("link", { name: "Discover this pair" })
    .getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(href!);
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "View cart" }).click();

  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Phone number")).toBeVisible();
  await expect(page.getByLabel("Delivery area")).toBeVisible();
  await expect(page.getByLabel("Full delivery address")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Submit order request",
    }),
  ).toBeDisabled();
});

test("clears old persistent cart storage on the next visit", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "shoesoco-cart-v2",
      JSON.stringify({ version: 2, items: [] }),
    );
    localStorage.setItem(
      "shoesco-cart-v2",
      JSON.stringify({ version: 2, items: [] }),
    );
  });

  await page.goto("/cart");

  await expect
    .poll(() =>
      page.evaluate(() => ({
        current: localStorage.getItem("shoesoco-cart-v2"),
        legacy: localStorage.getItem("shoesco-cart-v2"),
      })),
    )
    .toEqual({ current: null, legacy: null });
});
