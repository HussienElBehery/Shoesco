import { expect, test, type Page } from "@playwright/test";

async function openCartWithTestItem(page: Page) {
  await page.route("**/api/health", async (route) => {
    await route.fulfill({ contentType: "application/json", body: '{"ok":true}' });
  });
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "shoesoco-cart-v2",
      JSON.stringify({
        version: 2,
        items: [
          {
            key: "123e4567-e89b-42d3-a456-426614174001:40:Black",
            productId: "123e4567-e89b-42d3-a456-426614174001",
            slug: "runner",
            name: "Runner",
            image: "",
            size: "40",
            color: "Black",
            unitPrice: 2500,
            quantity: 1,
            availableSizes: ["40"],
            availableColors: ["Black"],
          },
        ],
      }),
    );
  });
  await page.goto("/cart", { waitUntil: "domcontentloaded" });
}

test("opens directly into the simplified product hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("site-intro")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Shop Now" })).toHaveAttribute("href", "/products");
  await expect(page.getByText("Sneakers / Running / Shoe Care", { exact: true })).toBeVisible();
  await expect(page.getByText(/Crease Protector/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /representative shoe/i })).toHaveCount(0);
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
  await card.getByRole("button", { name: "Quick view" }).click();
  await page.getByRole("dialog", { name: "Quick preview" }).getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("dialog", { name: "Added to your rotation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Added to cart" })).toHaveCount(1);
});

test("shows only customer-facing gender filters", async ({ page }) => {
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await expect(page.getByPlaceholder("Search products, colors, or collections")).toBeEnabled({
    timeout: 15000,
  });
  await expect(page.getByLabel("Gender").locator("option")).toHaveText([
    "All",
    "Men",
    "Women",
  ]);
  const sizeOptions = await page.getByLabel("Size").locator("option").allTextContents();
  expect(sizeOptions).not.toContain("-");
  expect(sizeOptions).not.toContain("_");
});

test("core storefront pages do not overflow horizontally", async ({ page }) => {
  test.setTimeout(60000);
  for (const path of ["/", "/products", "/about", "/contact", "/cart"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
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
    .getByRole("link", { name: /Buy now/ })
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
  await openCartWithTestItem(page);

  await expect(page.getByLabel("Name")).toBeVisible();
  const email = page.getByLabel("Email (optional)");
  await expect(email).toBeVisible();
  await expect(email).not.toHaveAttribute("required", "");
  await expect(page.getByLabel("Phone number")).toBeVisible();
  await expect(page.getByLabel("Delivery area")).toBeVisible();
  await expect(page.getByLabel("Full delivery address")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Submit order request",
    }),
  ).toBeDisabled();
});

test("shows the reviews empty state instead of the old why section", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("shoesoco-intro-seen", "true");
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Shared by our customers." })).toBeVisible();
  await expect(
    page.getByText("Customer review screenshots will appear here soon."),
  ).toBeVisible();
  await expect(page.getByText("Less noise. Better choices.")).toHaveCount(0);
});

test("limits the homepage product preview and links to the full catalog", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("shoesoco-intro-seen", "true");
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const featuredSection = page.locator("section").filter({
    has: page.getByRole("heading", { name: "A better daily rotation." }),
  });
  await expect(featuredSection.locator("article")).toHaveCount(4);
  await expect(
    featuredSection.getByRole("link", { name: "View all products" }),
  ).toHaveAttribute("href", "/products");
});

test("keeps product cards and Buy now actions aligned when a name wraps", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const featuredSection = page.locator("section").filter({
    has: page.getByRole("heading", { name: "A better daily rotation." }),
  });
  const cards = featuredSection.locator("article");
  await expect(cards).toHaveCount(4);

  await cards.first().locator("h2 a").evaluate((link) => {
    link.textContent = "An intentionally long product name that must wrap onto a second line";
  });

  const metrics = await cards.evaluateAll((elements) =>
    elements.slice(0, 2).map((card) => {
      const cardRect = card.getBoundingClientRect();
      const buyNow = card.querySelector('a[aria-label^="Buy now"]');
      const buttonRect = buyNow?.getBoundingClientRect();
      return {
        cardHeight: cardRect.height,
        buttonTop: buttonRect?.top ?? 0,
      };
    }),
  );

  expect(Math.abs(metrics[0].cardHeight - metrics[1].cardHeight)).toBeLessThanOrEqual(1);
  expect(Math.abs(metrics[0].buttonTop - metrics[1].buttonTop)).toBeLessThanOrEqual(1);
});

test("redirects a saved order to WhatsApp in the same tab", async ({ page }) => {
  const whatsappDraft = "مساء الخير، أود استكمال تأكيد طلبي. برجاء مراجعة الطلب وتأكيد تكلفة الشحن.";
  const siteMessage = "مساء الخير اوردر رقم SCO-260717-ABC123 حضرتك طالب 1x Runner مقاس 40 لون Black ببلغ حضرتك ان تأكيد اي اوردر بيكون بتحويل الشحن علي الرقم دا 01154497618";
  let whatsappRequest = "";
  await page.route("https://wa.me/**", async (route) => {
    whatsappRequest = route.request().url();
    await route.fulfill({
      contentType: "text/html",
      body: "<h1>WhatsApp handoff</h1>",
    });
  });
  await page.route("**/api/orders", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        reference: "SCO-260717-ABC123",
        orderItems: [
          {
            productId: "123e4567-e89b-42d3-a456-426614174001",
            slug: "runner",
            name: "Runner",
            image: "",
            size: "40",
            color: "Black",
            quantity: 1,
            unitPrice: 2500,
            lineTotal: 2500,
          },
        ],
        subtotal: 2500,
        siteConfirmationMessage: siteMessage,
        whatsappMessage: whatsappDraft,
        emailDelivery: "not_requested",
      }),
    });
  });
  await openCartWithTestItem(page);

  await page.getByLabel("Name").fill("Mona Ali");
  await page.getByLabel("Phone number").fill("01012345678");
  await page.getByLabel("Delivery area").fill("Cairo");
  await page.getByLabel("Full delivery address").fill("Building 4, apartment 12");
  await page.getByRole("button", { name: "Submit order request" }).click();

  await expect(page).toHaveURL(/wa\.me\/201069368315\?text=/);
  expect(whatsappRequest).toBe(page.url());
  const handoffUrl = new URL(page.url());
  expect(handoffUrl.searchParams.get("text")).toBe(whatsappDraft);
  expect(handoffUrl.searchParams.get("text")).not.toContain("01154497618");
  await expect(page.getByRole("link", { name: "Continue on WhatsApp" })).toHaveCount(0);
});

test("keeps the cart in place when order submission fails", async ({ page }) => {
  await page.route("**/api/orders", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 500,
      body: JSON.stringify({ error: "We could not save your order." }),
    });
  });
  await openCartWithTestItem(page);

  await page.getByLabel("Name").fill("Mona Ali");
  await page.getByLabel("Phone number").fill("01012345678");
  await page.getByLabel("Delivery area").fill("Cairo");
  await page.getByLabel("Full delivery address").fill("Building 4, apartment 12");
  await page.getByRole("button", { name: "Submit order request" }).click();

  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByText("We could not save your order.", { exact: true })).toBeVisible();
  await expect(page.getByText("Runner", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("shoesoco-cart-v2"))).toContain("Runner");
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
