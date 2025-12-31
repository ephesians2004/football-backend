/**
 * Redis Cache – Flexible wrapper to avoid backend crashing
 * Works even if Redis unavailable (fails open)
 */

const Redis = require("ioredis");

let client;

try {
  client = new Redis(process.env.REDIS_URL, {
    retryStrategy: () => 1000,
    maxRetriesPerRequest: null,
    enableReadyCheck: true
  });

  client.on("ready", () => console.log("⚡ Redis connected"));
  client.on("error", () => console.log("⚠️ Redis error – running fallback mode"));
} catch (e) {
  console.log("⚠️ Redis init failed, cache disabled");
}

/**
 * Get cached value by key
 */
async function get(key) {
  try {
    if (!client) return null;
    return await client.get(key);
  } catch {
    return null;
  }
}

/**
 * Set cached value with TTL in seconds
 */
async function set(key, value, ttl = 360) {
  try {
    if (!client) return;
    await client.set(key, value, "EX", ttl);
  } catch {}
}

/**
 * Check if Redis is connected
 */
function isConnected() {
  return client && client.status === "ready";
}

module.exports = {
  client,
  get,
  set,
  isConnected
};
