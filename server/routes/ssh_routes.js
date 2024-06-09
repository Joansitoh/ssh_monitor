import fs from "fs";
import util from "util";
import fetch from "node-fetch";

const NETVISR_SSH_VALID_PATH = "/var/log/netvisr/ssh_accepted.log";
const NETVISR_SSH_INVALID_PATH = "/var/log/netvisr/ssh_failed.log";
const NETVISR_SUDO_VALID_PATH = "/var/log/netvisr/sudo_accepted.log";
const NETVISR_SUDO_INVALID_PATH = "/var/log/netvisr/sudo_failed.log";

async function getLocation(ip) {
  if (ip === "::1") return { country: "Localhost", loc: "0,0" };
  if (!ip) return { country: "Unknown", loc: "0,0" };

  try {
    const url = `https://ipinfo.io/${ip}?token=a0b71cd8b4fcd5`;
    const response = await fetch(url);
    const data = await response.json();
    return {
      country: data.country,
      loc: data.loc,
      city: data.city,
    };
  } catch (error) {
    console.error(`Failed to get location for IP ${ip}:`, error);
    return { country: "Unknown", loc: "0,0" };
  }
}

export default async function (fastify, opts) {
  const readFile = util.promisify(fs.readFile);

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
          const parts = line.split(" ");
          const timestamp = parts[0];
          const user = parts[2];
          return { user, timestamp: new Date(timestamp) };
        }, []);
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
          const parts = line.split(" ");
          const timestamp = parts[0];
          const user = parts[1];
          return { user, timestamp: new Date(timestamp) };
        }, []);
    } catch (err) {
      console.error(err);
      return { error: "Unable to read sudo failure logs" };
    }
  });
}
