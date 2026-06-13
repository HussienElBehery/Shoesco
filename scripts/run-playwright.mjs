import { spawn } from "node:child_process";

const environment = {
  ...process.env,
  PLAYWRIGHT_EXTERNAL_SERVER: "1",
  SHOESOCO_OFFLINE_DEV: process.env.SHOESOCO_OFFLINE_DEV ?? "1",
};
const server = spawn(process.execPath, ["scripts/playwright-server.mjs"], {
  cwd: process.cwd(),
  env: environment,
  stdio: ["ignore", "inherit", "inherit"],
});

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch("http://127.0.0.1:3000");
      if (response.ok) return;
    } catch {
      // The development server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("The Playwright server did not become ready.");
}

async function stopServer() {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

let exitCode = 1;
try {
  await waitForServer();
  const playwright = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    {
      cwd: process.cwd(),
      env: environment,
      stdio: "inherit",
    },
  );
  exitCode = await new Promise((resolve) =>
    playwright.once("exit", (code) => resolve(code ?? 1)),
  );
} finally {
  await stopServer();
}

process.exit(exitCode);
