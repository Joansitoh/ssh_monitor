import { cacheManager } from "../manager/cacheManager.js";
import { logsManager } from "../manager/logsManager.js";

const getMethodFilter = async (method) => {
  switch (method) {
    case "success":
      return await logsManager.getSSHSuccessLogs();
    case "invalid":
      return await logsManager.getSSHFailedLogs();
    default:
      return [];
  }
};

const processLogData = async (data) => {
  let countries = {};
  let cities = {};
  let usernames = {};

  for (const entry of data) {
    const { ip, user } = entry;
    const locationCache = await cacheManager.getCachedLocation(ip);
    const country = locationCache?.country || "Unknown";
    const city = locationCache?.city || "Unknown";

    countries[country] = countries[country] || {
      count: 0,
      location: locationCache?.loc,
    };
    countries[country].count++;

    cities[city] = cities[city] || { count: 0 };
    cities[city].count++;

    if (!usernames[user]) {
      usernames[user] = { count: 0, cities: {}, locations: {} };
    }
    usernames[user].count++;
    usernames[user].cities[city] = (usernames[user].cities[city] || 0) + 1;
    usernames[user].locations[city] =
      usernames[user].locations[city] || locationCache?.loc || "0,0";
  }

  return { countries, cities, usernames };
};

const sortAndLimit = (obj, limit = 100) => {
  return Object.fromEntries(
    Object.entries(obj)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
  );
};

export default async function (fastify, opts) {
  fastify.get("/ssh-logs/:method/general", async (request, reply) => {
    try {
      const { method } = request.params;
      const data = await getMethodFilter(method);
      const { countries, cities, usernames } = await processLogData(data);

      return {
        total: data.length,
        countries,
        cities: sortAndLimit(cities),
        usernames: sortAndLimit(usernames),
      };
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
  });

  fastify.get("/ssh-logs/:method/users", async (request, reply) => {
    try {
      const { method } = request.params;
      const data = await getMethodFilter(method);
      const { page = 1, limit = 100 } = request.query;

      const start = (page - 1) * limit;
      const end = page * limit;

      const { usernames } = await processLogData(data);
      const usernamesArray = Object.entries(usernames).sort(
        (a, b) => b[1].count - a[1].count
      );

      return {
        total: data.length,
        usernames: Object.fromEntries(usernamesArray.slice(start, end)),
      };
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
  });

  fastify.get("/ssh-logs/:method/data", async (request, reply) => {
    try {
      const { method } = request.params;
      let data = await getMethodFilter(method);

      const startData =
        request.query.start && new Date(Number(request.query.start));
      const endData = request.query.end && new Date(Number(request.query.end));

      if (startData && endData) {
        data = data.filter(
          (log) => log.timestamp >= startData && log.timestamp <= endData
        );
      }

      return data.map(({ user, timestamp }) => ({ user, timestamp }));
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
  });
}
