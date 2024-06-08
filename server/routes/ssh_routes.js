import fs from "fs";
import util from "util";

const NETVISR_SSH_VALID_PATH = "/var/log/netvisr/ssh_accepted.log";
const NETVISR_SSH_INVALID_PATH = "/var/log/netvisr/ssh_failed.log";
const NETVISR_SUDO_VALID_PATH = "/var/log/netvisr/sudo_success.log";
const NETVISR_SUDO_INVALID_PATH = "/var/log/netvisr/sudo_failed.log";

export default async function (fastify, opts) {
  const readFile = util.promisify(fs.readFile);

  fastify.get("/test", async (request, reply) => {
    try {
      const data = await readFile("/var/log/auth.log", "utf8");
      const failedAttempts = data.match(/^.*Failed password.*$/gm);
      const successfulAttempts = data.match(/^.*session opened for user.*$/gm);

      return {
        failedAttempts: failedAttempts.length,
        successfulAttempts: successfulAttempts.length,
        failedAttemptsData: failedAttempts,
        successfulAttemptsData: successfulAttempts,
      };
    } catch (err) {
      console.error(err);
      return { error: "Unable to read SSH logs" };
    }
  });

  fastify.get("/ssh-logs/success", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SSH_VALID_PATH, "utf8");
      // FORMAT: 2024-06-09T00:14:43.485508+02:00  Accepted password for megalul from ::1 port 39962 ssh2

      return data.split("\n").map((line) => {
        const parts = line.split(" ");
        const timestamp = parts[0];
        const user = parts[parts.indexOf("for") + 1];
        const ip = parts[parts.indexOf("from") + 1];
        return { ip, user, timestamp: new Date(timestamp) };
      });

      const sshSuccess = data
        .split("\n")
        .filter((line) => line.includes("sshd") && line.includes("Accepted"))
        .map((line) => {
          const parts = line.split(" ");
          const timestamp = parts[0];
          const user = parts[parts.indexOf("for") + 1];
          const ip = parts[parts.indexOf("from") + 1];
          return { ip, user, timestamp: new Date(timestamp) };
        });
      return { ...sshSuccess };
    } catch (err) {
      console.error(err);
      return { error: "Unable to read SSH logs" };
    }
  });

  fastify.get("/ssh-logs/invalid", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SSH_INVALID_PATH, "utf8");
      // FORMAT: 2024-06-09T00:14:43.485508+02:00  Failed password for megalul from ::1 port 49942 ssh2

      return data.split("\n").map((line) => {
        const parts = line.split(" ");
        const timestamp = parts[0];
        const user = parts[parts.indexOf("for") + 1];
        const ip = parts[parts.indexOf("from") + 1];
        return { ip, user, timestamp: new Date(timestamp) };
      }, []);

      const sshInvalid = data
        .split("\n")
        .filter(
          (line) => line.includes("sshd") && line.includes("Failed password")
        )
        .map((line) => {
          const parts = line.split(" ");
          const timestamp = parts[0];
          const user = parts[parts.indexOf("for") + 1];
          const ip = parts[parts.indexOf("from") + 1];
          return { ip, user, timestamp };
        });
      return { ...sshInvalid };
    } catch (err) {
      console.error(err);
      return { error: "Unable to read SSH logs" };
    }
  });

  fastify.get("/sudo-logs/success", async (request, reply) => {
    try {
      const data = await readFile(NETVISR_SUDO_VALID_PATH, "utf8");
      // FORMAT: 2024-06-09T00:10:29.489696+02:00 megalul

      return data.split("\n").map((line) => {
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

      return data.split("\n").map((line) => {
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
