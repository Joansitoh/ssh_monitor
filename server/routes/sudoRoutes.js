import { logsManager } from "../manager/logsManager.js";

const getMethodFilter = async (method) => {
  switch (method) {
    case "success":
      return logsManager.getSudoSuccessLogs();
    case "invalid":
      return logsManager.getSudoFailedLogs();
    default:
      return [];
  }
};

const formatUsernames = (data) => {
  const usernames = {};
  for (const entry of data) {
    const { user } = entry;
    if (usernames[user]) {
      usernames[user].count++;
    } else {
      usernames[user] = { count: 1 };
    }
  }
  return usernames;
};

const filterByDateRange = (data, start, end) => {
  if (start && end) {
    const startDate = new Date(Number(start));
    const endDate = new Date(Number(end));
    return data.filter(
      (log) => log.timestamp >= startDate && log.timestamp <= endDate
    );
  }
  return data;
};

export default async function (fastify, opts) {
  fastify.get("/sudo-logs/:method/general", async (request, reply) => {
    try {
      const { method } = request.params;
      const data = await getMethodFilter(method);
      const usernames = formatUsernames(data);

      return { total: data.length, usernames };
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: error.message });
    }
  });

  fastify.get("/sudo-logs/:method/data", async (request, reply) => {
    try {
      const { method } = request.params;
      const { start, end } = request.query;
      let data = await getMethodFilter(method);

      data = filterByDateRange(data, start, end);

      return data.map(({ user, timestamp }) => ({ user, timestamp }));
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: error.message });
    }
  });
}
