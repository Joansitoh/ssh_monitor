import fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

// Routes
import ssh_routes from "./routes/ssh_routes.js";
import { checkSyslog, createSyslog, restartSyslog } from "./syslog.js";

const server = fastify({ logger: false });

const PORT = 5000;
const API_ROUTE = "/api";

let start = Date.now();
console.clear();
console.log();
console.log("  Checking for syslog configuration...");

// Check if syslog configuration exists
const syslog = checkSyslog();
if (!syslog) {
  console.log("  Syslog configuration not found. Creating...");
  try {
    createSyslog();
    restartSyslog();
  } catch (err) {
    console.error(
      "  Unable to create syslog configuration. Check permissions."
    );
    console.error(err);
    process.exit(1);
  }
}

console.log("  Syslog configuration found.");
console.log();

const startServer = async () => {
  server.register(cors);
  server.register(websocket);

  server.register(ssh_routes, { prefix: API_ROUTE });

  server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    let diff = Date.now() - start;
    console.log();
    console.log(`  SSH MONITOR API v5.1.5  ready in ${diff} ms`);
    console.log();
    console.log(`  ➜    Local:   ${address}`);
    console.log();
  });
};

startServer();
