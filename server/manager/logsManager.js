import util from "util";
import fs from "fs";

const readFile = util.promisify(fs.readFile);

const LOG_PATHS = {
  SSH_VALID: "/var/log/netvisr/ssh_accepted.log",
  SSH_INVALID: "/var/log/netvisr/ssh_failed.log",
  SUDO_VALID: "/var/log/netvisr/sudo_accepted.log",
  SUDO_INVALID: "/var/log/netvisr/sudo_failed.log",
};

const parseLogLine = (line, extractors) => {
  const parts = line.split(" ");
  const parsedData = {};

  for (const [key, extractor] of Object.entries(extractors)) {
    parsedData[key] = extractor(parts);
  }

  return parsedData;
};

const extractors = {
  SSH_INVALID: {
    user: (parts) =>
      parts.includes("for")
        ? parts[parts.indexOf("for") + 1]
        : parts[parts.indexOf("user") + 1],
    ip: (parts) => parts[parts.indexOf("from") + 1],
  },
  SSH_VALID: {
    timestamp: (parts) => new Date(parts[0]),
    user: (parts) => parts[parts.indexOf("for") + 1],
    ip: (parts) => parts[parts.indexOf("from") + 1],
  },
  SSH_FAILED: {
    timestamp: (parts) => new Date(parts[0]),
    user: (parts) =>
      parts.includes("for")
        ? parts[parts.indexOf("for") + 1]
        : parts[parts.indexOf("user") + 1],
    ip: (parts) => parts[parts.indexOf("from") + 1],
  },
  SUDO_VALID: {
    timestamp: (parts) => new Date(parts[0]),
    user: (parts) => parts[parts.length - 1],
  },
  SUDO_INVALID: {
    timestamp: (parts) => new Date(parts[0]),
    user: (parts) => parts[parts.length - 1],
  },
};

const getLogs = async (filePath, extractors) => {
  const data = await readFile(filePath, "utf8");
  const lines = data.split("\n").filter((line) => line !== "");

  return lines.map((line) => parseLogLine(line, extractors));
};

const logsManager = {
  getSSHInvalidLogs: () =>
    getLogs(LOG_PATHS.SSH_INVALID, extractors.SSH_INVALID),
  getSSHSuccessLogs: () => getLogs(LOG_PATHS.SSH_VALID, extractors.SSH_VALID),
  getSSHFailedLogs: () => getLogs(LOG_PATHS.SSH_INVALID, extractors.SSH_FAILED),
  getSudoSuccessLogs: () =>
    getLogs(LOG_PATHS.SUDO_VALID, extractors.SUDO_VALID),
  getSudoFailedLogs: () =>
    getLogs(LOG_PATHS.SUDO_INVALID, extractors.SUDO_INVALID),
};

export { logsManager };
