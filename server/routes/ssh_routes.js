import fs from "fs";
import util from "util";

export default async function (fastify, opts) {
  const readFile = util.promisify(fs.readFile);

  fastify.get("/ssh-logs/success", async (request, reply) => {
    try {
      const data = await readFile("/var/log/auth.log", "utf8");
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
      const data = await readFile("/var/log/auth.log", "utf8");
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
      const data = await readFile("/var/log/auth.log", "utf8");
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
      const data = await readFile("/var/log/auth.log", "utf8");
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
