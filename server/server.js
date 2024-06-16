import fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

// Routes
import sshRoutes from "./routes/sshRoutes.js";
import sudoRoutes from "./routes/sudoRoutes.js";

import {
  checkSyslog,
  createSyslog,
  restartSyslog,
  createCronJob,
  createScripts,
} from "./syslog.js";
import { cacheManager } from "./manager/cacheManager.js";

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

/* console.log("  Creating scripts and cron jobs...");

try {
  createCronJob();
  createScripts();
} catch (err) {
  console.error("  Unable to create scripts and cron jobs.");
  console.error(err);
  process.exit(1);
}

console.log("  Scripts and cron jobs created.");
console.log(); */

const startServer = async () => {
  server.register(cors);
  server.register(websocket);

  console.log("  Registering routes...");

  server.register(sshRoutes, { prefix: API_ROUTE });
  server.register(sudoRoutes, { prefix: API_ROUTE });

  console.log("  Processing cache data...");

  cacheManager.processCacheFinderQueue();
  cacheManager.processCacheQueue();
  cacheManager.processCacheMap();

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
