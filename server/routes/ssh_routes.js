import fs from "fs";
import util from "util";

const NETVISR_SSH_VALID_PATH = "/var/log/netvisr/ssh_accepted.log";
const NETVISR_SSH_INVALID_PATH = "/var/log/netvisr/ssh_failed.log";
const NETVISR_SUDO_VALID_PATH = "/var/log/netvisr/sudo_success.log";
const NETVISR_SUDO_INVALID_PATH = "/var/log/netvisr/sudo_failed.log";

export default async function (fastify, opts) {
  const readFile = util.promisify(fs.readFile);

  fastify.get("/ssh-logs/success", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SSH_VALID_PATH, "utf8");
      // FORMAT: 2024-06-09T00:14:43.485508+02:00  Accepted password for megalul from ::1 port 39962 ssh2
      // FORMAT: 2024-06-09T00:47:45.572654+00:00  Accepted publickey for ubuntu from 37.135.149.188 port 32928 ssh2: RSA SHA256:1yRj7Kr7A1/oPu6FbR/iA7hfEapVvm6JTgBOeDq66yo

      return data
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => {
          const parts = line.split(" ");
          const timestamp = parts[0];
          const user = parts[parts.indexOf("for") + 1];
          const ip = parts[parts.indexOf("from") + 1];
          return { ip, user, timestamp: new Date(timestamp) };
        }, []);
      return { ...sshSuccess };
    } catch (err) {
      console.error(err);
      return { error: "Unable to read SSH logs" };
    }
  });

  fastify.get("/ssh-logs/invalid", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SSH_INVALID_PATH, "utf8");

      return data
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => {
          // Check if is empty line
          const parts = line.split(" ");
          const timestamp = parts[0];
          const forIndex = parts.indexOf("for");
          const userIndex = parts.indexOf("user");
          const fromIndex = parts.indexOf("from");
          const user =
            forIndex !== -1 ? parts[forIndex + 1] : parts[userIndex + 1];
          const ip = parts[fromIndex + 1];
          console.log("Line: ", line, "User: ", user, "IP: ", ip);
          return { ip, user, timestamp: new Date(timestamp) };
        }, []);
    } catch (err) {
      console.error(err);
      return { error: "Unable to read SSH logs" };
    }
  });

  fastify.get("/sudo-logs/success", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SUDO_VALID_PATH, "utf8");
      // FORMAT: 2024-06-09T00:10:29.489696+02:00 megalul

      return data
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => {
          const parts = line.split(" ");
          const timestamp = parts[0];
          const user = parts[1];
          return { user, timestamp: new Date(timestamp) };
        }, []);

      const sudoSuccessPattern =
        /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}).* sudo: pam_unix\(sudo:session\): session opened for user root\(uid=0\) by (\w+)/g;

      const sudoSuccess = [];
      let match;
      while ((match = sudoSuccessPattern.exec(data)) !== null) {
        const timestamp = new Date(match[1]);
        const user = match[2];
        sudoSuccess.push({ user, timestamp });
      }

      return { ...sudoSuccess };
    } catch (err) {
      console.error(err);
      return { error: "Unable to read sudo success logs" };
    }
  });

  fastify.get("/sudo-logs/invalid", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SUDO_INVALID_PATH, "utf8");
      // FORMAT: 2024-06-09T00:10:29.489696+02:00 megalul

      return data
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => {
          const parts = line.split(" ");
          const timestamp = parts[0];
          const user = parts[1];
          return { user, timestamp: new Date(timestamp) };
        }, []);

      const sudoFailurePattern =
        /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}).* sudo: pam_unix\(sudo:auth\): authentication failure;.* user=(\w+)/g;

      const sudoFailures = [];
      let match;
      while ((match = sudoFailurePattern.exec(data)) !== null) {
        const timestamp = new Date(match[1]);
        const user = match[2];
        sudoFailures.push({ user, timestamp });
      }

      return { ...sudoFailures };
    } catch (err) {
      console.error(err);
      return { error: "Unable to read sudo failure logs" };
    }
  });
}
