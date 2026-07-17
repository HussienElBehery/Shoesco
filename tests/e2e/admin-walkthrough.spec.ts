import { expect, test } from "@playwright/test";

const adminEmail = process.env.SHOESOCO_TEST_ADMIN_EMAIL;
const adminPassword = process.env.SHOESOCO_TEST_ADMIN_PASSWORD;

test("owner creates a product and a guest can shop it", async ({ browser }) => {
  test.setTimeout(120_000);
  test.skip(
    !adminEmail || !adminPassword,
    "Admin walkthrough credentials are not configured.",
  );
  if (!adminEmail || !adminPassword) return;

  const suffix = Date.now().toString().slice(-8);
  const productName = `QA Walkthrough Sneaker ${suffix}`;
  const productSlug = `qa-walkthrough-sneaker-${suffix}`;
  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  const errors: string[] = [];

  ownerPage.on("pageerror", (error) => errors.push(`owner page: ${error.message}`));
  ownerPage.on("console", (message) => {
    if (message.type() === "error") errors.push(`owner console: ${message.text()}`);
  });

  await ownerPage.goto("/admin/login");
  await ownerPage.getByLabel("Email").fill(adminEmail);
  await ownerPage.getByLabel("Password").fill(adminPassword);
  await ownerPage.getByRole("button", { name: "Sign in" }).click();
  await expect(ownerPage).toHaveURL(/\/admin$/);
  await expect(ownerPage.getByRole("heading", { name: "Today at Shoesoco" })).toBeVisible();

  await ownerPage.goto("/admin/settings");
  await expect(ownerPage.getByRole("heading", { name: "Gmail confirmation delivery" })).toBeVisible();
  await expect(ownerPage.getByText("Ahmed.rag789@gmail.com", { exact: false })).toBeVisible();
  await expect(ownerPage.getByRole("button", { name: "Save and test Gmail" })).toBeVisible();
  await expect(ownerPage.getByLabel("Featured pair")).toBeVisible();
  await expect(ownerPage.getByLabel("Website message to the buyer")).toHaveValue(/\{order_reference\}/);
  await expect(ownerPage.getByLabel("WhatsApp message from the buyer to Shoesoco")).toHaveValue(/\{item_list\}/);
  const savedHeroTitle = await ownerPage.getByLabel("Homepage headline").inputValue();
  await ownerPage.getByRole("button", { name: "Save settings" }).click();
  await expect(ownerPage).toHaveURL(/\/admin\/settings\?saved=1$/);
  await expect(ownerPage.getByText("Settings saved and public pages refreshed.")).toBeVisible();

  await ownerPage.goto("/admin/reviews");
  await expect(ownerPage.getByRole("heading", { name: "Reviews" })).toBeVisible();
  const existingReviews = await ownerPage.locator("article").count();
  let reviewAlt = "";
  if (existingReviews < 20) {
    reviewAlt = `Temporary review audit ${suffix}`;
    await ownerPage.locator('input[name="reviewImages"]').setInputFiles("public/images/Logo.jpeg");
    await ownerPage.getByRole("button", { name: "Upload reviews" }).click();
    await expect(ownerPage).toHaveURL(/\/admin\/reviews\?uploaded=1$/);
    const uploadedReview = ownerPage.locator("article").last();
    await uploadedReview.getByLabel("Accessibility description").fill(reviewAlt);
    await uploadedReview.getByRole("button", { name: "Save description" }).click();
    await expect(ownerPage).toHaveURL(/\/admin\/reviews\?saved=1$/);
    await expect(
      ownerPage.locator("article").last().getByLabel("Accessibility description"),
    ).toHaveValue(reviewAlt);
  }

  await ownerPage.goto("/admin/products");
  await ownerPage.getByPlaceholder("Search products").fill("QA Walkthrough Sneaker");
  for (let index = 0; index < 10; index += 1) {
    const archiveButtons = ownerPage.getByRole("button", { name: "Archive" });
    if ((await archiveButtons.count()) === 0) break;
    await archiveButtons.first().click();
    await expect(ownerPage).toHaveURL(/\/admin\/products$/);
    await ownerPage.getByPlaceholder("Search products").fill("QA Walkthrough Sneaker");
  }

  await ownerPage.goto("/admin/products/new");
  await ownerPage.getByLabel("Product name").fill(productName);
  await ownerPage.getByLabel("URL slug").fill(productSlug);
  await ownerPage.getByLabel("Price in EGP").fill("2850");
  await ownerPage.getByLabel("Category").selectOption("Sneakers");
  await ownerPage.getByLabel("Gender").selectOption({ label: "None" });
  await ownerPage.getByLabel("Colors, separated by commas").fill("Black, White");
  await ownerPage.locator('select[name="fit"]').selectOption("True to size");
  await ownerPage.locator('select[name="width"]').selectOption("Standard");
  await ownerPage.getByLabel("Merchandising label").fill("QA test");
  await ownerPage.getByLabel("Short description").fill("A temporary published product used for the owner-to-customer walkthrough.");
  await ownerPage.getByLabel("Full description").fill("This product verifies catalog creation, public listing, product details, cart behavior, and checkout validation.");
  await ownerPage.getByLabel("Fit note").fill("Fits true to size.");
  await ownerPage.getByLabel("Materials").fill("Mesh and synthetic upper.");
  await ownerPage.getByLabel("Care instructions").fill("Wipe clean with a soft brush and foam cleaner.");
  await ownerPage.getByRole("button", { name: "Create product" }).click();
  await expect(ownerPage).toHaveURL(/\/admin\/products$/);
  await ownerPage.getByPlaceholder("Search products").fill(productName);
  await expect(ownerPage.getByText(productName, { exact: true })).toBeVisible();

  const productRow = ownerPage.locator("div").filter({ hasText: productName }).filter({
    has: ownerPage.getByRole("button", { name: "Archive" }),
  }).last();

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  guestPage.on("pageerror", (error) => errors.push(`guest page: ${error.message}`));
  guestPage.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("503")) {
      errors.push(`guest console: ${message.text()}`);
    }
  });

  await guestPage.goto("/");
  await expect(guestPage.getByRole("heading", { level: 1, name: savedHeroTitle })).toBeVisible();
  if (reviewAlt) {
    await expect(guestPage.getByAltText(reviewAlt)).toBeVisible();
  }

  await guestPage.goto(`/products?q=${encodeURIComponent(productName)}`);
  await expect(guestPage.getByText(productName, { exact: true })).toBeVisible();
  await guestPage.getByText(productName, { exact: true }).click();
  await expect(guestPage).toHaveURL(new RegExp(`/products/[0-9a-f-]+$`));
  await expect(guestPage.getByRole("heading", { name: productName })).toBeVisible();
  await expect(guestPage.getByText("EGP\u00a02,850")).toBeVisible();
  await guestPage.getByRole("button", { name: "Add to cart" }).click();
  await expect(guestPage.getByRole("dialog", { name: "Added to your rotation" })).toBeVisible();
  await guestPage.getByRole("link", { name: "View cart" }).click();
  await expect(guestPage.getByText(productName, { exact: true })).toBeVisible();
  await guestPage.getByLabel("Name").fill("QA Customer");
  await guestPage.getByLabel("Email (optional)").fill("qa.customer@example.com");
  await guestPage.getByLabel("Phone number").fill("+20 100 000 0000");
  await guestPage.getByLabel("Delivery area").fill("New Cairo");
  await guestPage.getByLabel("Full delivery address").fill("QA Street, Building 1, Apartment 2");
  await expect(
    guestPage.getByRole("button", { name: "Submit order request" }),
  ).toBeVisible();
  await expect(guestPage.getByText(productName, { exact: true })).toBeVisible();

  await ownerPage.bringToFront();
  if (reviewAlt) {
    await ownerPage.goto("/admin/reviews");
    const reviewToDelete = ownerPage.locator("article").last();
    await expect(
      reviewToDelete.getByLabel("Accessibility description"),
    ).toHaveValue(reviewAlt);
    ownerPage.once("dialog", (dialog) => dialog.accept());
    await reviewToDelete.getByRole("button", { name: "Delete screenshot" }).click();
    await expect(ownerPage).toHaveURL(/\/admin\/reviews\?deleted=1$/);
    await guestPage.goto("/");
    await expect(guestPage.getByAltText(reviewAlt)).toHaveCount(0);
  }

  await ownerPage.goto("/admin/products");
  await ownerPage.getByPlaceholder("Search products").fill(productName);
  await productRow.getByRole("button", { name: "Archive" }).click();
  await expect(ownerPage.getByRole("button", { name: "Archive" })).toHaveCount(0);

  await guestPage.goto(`/products?q=${encodeURIComponent(productName)}`);
  await expect(
    guestPage.locator("main article").filter({ hasText: productName }),
  ).toHaveCount(0);

  expect(errors).toEqual([]);
  await guestContext.close();
  await ownerContext.close();
});
