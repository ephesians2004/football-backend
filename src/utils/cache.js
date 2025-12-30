/**
 * Cache System – Redis (if available) or In-Memory fallback
 */

const Redis = require("ioredis");

let client = null;
let memory = {};   // fallback store

function useRedis() {
  try {
    if (process.env.REDIS_URL) {
      client = new Redis(process.env.REDIS_URL, {
        reconnectOnError: false,
        maxRetriesPerRequest: 2,
        enableOfflineQueue: false
      });

      client.on("connect", () => console.log("🔌 Redis connected"));
      client.on("error", err => console.log("⚠️ Redis error", err.message));
      return true;
    }
  } catch {}
  return false;
}

const redisEnabled = useRedis();

module.exports.get = async function (key) {
  try {
    if (redisEnabled) {
      return await client.get(key);
    }
    return memory[key] || null;
  } catch {
    return null;
  }
};

module.exports.set = async function (key, value, ttl = 0) {
  try {
    if (redisEnabled) {
      if (ttl > 0) return client.set(key, value, "EX", ttl);
      return client.set(key, value);
    }
    memory[key] = value;
  } catch {}
};

module.exports.close = async function () {
  try {
    if (redisEnabled) await client.quit();
  } catch {}
};
