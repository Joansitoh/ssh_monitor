import path from "path";
import util from "util";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { logsManager } from "./logsManager.js";
import { fetchIPLocation } from "../geoloc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_PATH = path.resolve(__dirname, "cache.json");
let CACHE_MAP = {};
const CACHE_QUEUE = [];

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const cacheManager = {
  progressPercentage: 0,

  /**
   * Process the cache queue every second
   */
  processCacheQueue: async () => {
    setInterval(async () => {
      if (CACHE_QUEUE.length > 0) {
        try {
          const cacheData = CACHE_QUEUE.shift();
          const existingData = fs.existsSync(CACHE_PATH)
            ? JSON.parse(await readFile(CACHE_PATH, "utf8"))
            : {};

          const newData = { ...existingData, ...cacheData };
          await writeFile(CACHE_PATH, JSON.stringify(newData, null, 2));
        } catch (error) {
          console.error("Failed to process cache queue:", error);
        }
      }
    }, 1000);
  },

  /**
   * Process the geolocation queue every 5 minutes
   */
  processCacheFinderQueue: async () => {
    await cacheManager.processCacheFinder();
    setInterval(async () => {
      await cacheManager.processCacheFinder();
    }, 5 * 60 * 1000);
  },

  /**
   * Process the cache finder
   */
  processCacheFinder: async () => {
    const data = await readFile(CACHE_PATH, "utf8");
    const cacheData = JSON.parse(data);

    const successLogs = await logsManager.getSSHSuccessLogs();
    const failedLogs = await logsManager.getSSHFailedLogs();

    const sleep = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));

    const uniqueIpList = new Set();
    const logsData = [...successLogs, ...failedLogs];
    let processedCount = 0;

    const totalUniqueIps = new Set(logsData.map((log) => log.ip)).size;

    for (const log of logsData) {
      if (!uniqueIpList.has(log.ip)) {
        uniqueIpList.add(log.ip);

        if (!cacheData[log.ip]) {
          let location;
          while (true) {
            location = await fetchIPLocation(log.ip);
            if (location && location.country !== "Unknown") {
              break;
            } else {
              await sleep(10000);
              console.log(
                "Temporarily banned by ip-api.com. Waiting 10 seconds..."
              );
            }
          }
          CACHE_QUEUE.push({ [log.ip]: location });
          await sleep(500);
        }

        processedCount++;
        if (processedCount % 20 === 0 || processedCount === totalUniqueIps) {
          const percentage = ((processedCount / totalUniqueIps) * 100).toFixed(
            2
          );
          cacheManager.progressPercentage = percentage;
          console.log(
            `Processed: ${processedCount}, Percentage: ${cacheManager.progressPercentage}%`
          );
        }
      }
    }
  },

  /**
   * Load the cache map from the cache file
   */
  processCacheMap: async () => {
    try {
      if (fs.existsSync(CACHE_PATH)) {
        const data = await readFile(CACHE_PATH, "utf8");
        CACHE_MAP = JSON.parse(data);
      }
    } catch (error) {
      console.error("Failed to process cache map:", error);
    }
  },

  /**
   * Get the cached location for an IP
   */
  getCachedLocation: (ip) => CACHE_MAP[ip],
};

export { cacheManager };
