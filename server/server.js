import fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

// Routes
import ssh_routes from "./routes/ssh_routes.js";

const server = fastify({ logger: false });

const PORT = 5000;
const API_ROUTE = "/api";

let start = Date.now();
console.clear();
console.log();
console.log("  Starting server...");

const startServer = async () => {
    server.register(cors);
    server.register(websocket);

  // Node routes
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
