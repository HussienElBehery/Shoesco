import { createServer } from "node:http";
import next from "next";

const app = next({
  dev: true,
  dir: process.cwd(),
  hostname: "127.0.0.1",
  port: 3000,
});
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((request, response) => {
  void handle(request, response);
});

server.listen(3000, "127.0.0.1");

async function shutdown() {
  server.close();
  server.closeAllConnections();
  await Promise.race([
    app.close(),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
