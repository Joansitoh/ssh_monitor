import fs from "fs";
import util from "util";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NETVISR_SSH_VALID_PATH = "/var/log/netvisr/ssh_accepted.log";
const NETVISR_SSH_INVALID_PATH = "/var/log/netvisr/ssh_failed.log";
const NETVISR_SUDO_VALID_PATH = "/var/log/netvisr/sudo_accepted.log";
const NETVISR_SUDO_INVALID_PATH = "/var/log/netvisr/sudo_failed.log";

const CACHE_PATH = path.resolve(__dirname, "cache.json");
const CACHE_MAP = {};

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

let CACHE_QUEUE = [];

// Process cache queue every second
setInterval(async () => {
  if (CACHE_QUEUE.length > 0) {
    try {
      const cacheData = CACHE_QUEUE.shift();
      let existingData = {};

      if (fs.existsSync(CACHE_PATH)) {
        const data = await readFile(CACHE_PATH, "utf8");
        existingData = JSON.parse(data);
      }

      const newData = { ...existingData, ...cacheData };
      await writeFile(CACHE_PATH, JSON.stringify(newData, null, 2));
    } catch (error) {
      console.error("Failed to process cache queue:", error);
    }
  }
}, 1000);

async function getLocation(ip) {
  if (ip === "::1") return { country: "Localhost", loc: "0,0" };
  if (!ip) return { country: "Unknown", loc: "0,0" };

  // First, check if exist in memory cache
  if (CACHE_MAP[ip]) return CACHE_MAP[ip];

  // Then, check if exist in file cache
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const data = await readFile(CACHE_PATH, "utf8");
      const cache = JSON.parse(data);
      if (cache[ip]) {
        CACHE_MAP[ip] = cache[ip]; // Update memory cache
        return cache[ip];
      }
    }
  } catch (error) {
    console.error(`Failed to read cache for IP ${ip}:`, error);
  }

  // Finally, fetch location from ip-api.com
  try {
    const url = `http://ip-api.com/json/${ip}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== "success") {
      throw new Error(`API error! Message: ${data.message}`);
    }
    const location = {
      country: data.country,
      city: data.city,
      loc: [data.lat, data.lon].join(","), // lat,lon
    };

    // Update memory cache and queue to be saved in file cache
    CACHE_MAP[ip] = location;
    CACHE_QUEUE.push({ [ip]: location });

    return location;
  } catch (error) {
    console.error(`Failed to get location for IP ${ip}:`, error);
    return { country: "Unknown", loc: "0,0" };
  }
}

export default async function (fastify, opts) {
  fastify.get("/ssh-logs/success", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SSH_VALID_PATH, "utf8");
      const lines = data.split("\n").filter((line) => line !== "");

      const results = await Promise.all(
        lines.map(async (line) => {
          const parts = line.split(" ");
          const timestamp = parts[0];
          const user = parts[parts.indexOf("for") + 1];
          const ip = parts[parts.indexOf("from") + 1];
          const location = await getLocation(ip);
          return { ip, user, timestamp: new Date(timestamp), location };
        })
      );

      return results;
    } catch (err) {
      console.error(err);
      return { error: "Unable to read SSH logs" };
    }
  });

  fastify.get("/ssh-logs/invalid", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SSH_INVALID_PATH, "utf8");
      const lines = data.split("\n").filter((line) => line !== "");

      const results = await Promise.all(
        lines.map(async (line) => {
          const parts = line.split(" ");
          const timestamp = parts[0];
          const forIndex = parts.indexOf("for");
          const userIndex = parts.indexOf("user");
          const fromIndex = parts.indexOf("from");
          const user =
            forIndex !== -1 ? parts[forIndex + 1] : parts[userIndex + 1];
          const ip = parts[fromIndex + 1];
          const location = await getLocation(ip);
          return { ip, user, timestamp: new Date(timestamp), location };
        })
      );

      return results;
    } catch (err) {
      console.error(err);
      return { error: "Unable to read SSH logs" };
    }
  });

  fastify.get("/sudo-logs/success", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SUDO_VALID_PATH, "utf8");

      return data
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => {
          const parts = line.split(/\s+/);
          const timestamp = parts[0];
          const user = parts[1];
          return { user, timestamp: new Date(timestamp) };
        });
    } catch (err) {
      console.error(err);
      return { error: "Unable to read sudo success logs" };
    }
  });

  fastify.get("/sudo-logs/invalid", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SUDO_INVALID_PATH, "utf8");

      return data
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => {
          const parts = line.split(/\s+/);
          const timestamp = parts[0];
          const user = parts[1];
          return { user, timestamp: new Date(timestamp) };
        });
    } catch (err) {
      console.error(err);
      return { error: "Unable to read sudo failure logs" };
    }
  });
}
