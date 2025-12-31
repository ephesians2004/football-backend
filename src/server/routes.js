/**
 * API Router
 * Clean – Reliable – Safe (Never throws)
 */

const express = require("express");
const router = express.Router();
const cache = require("../utils/cache");

// scraper imports (direct – no safeRequire needed because we want errors visible during boot)
const { runFixturesOnce, runLiveOnce } = require("../cron/scrapeAll");
const injuries = require("../scrapers/injuriesEspn");

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------
async function getCache(key) {
  try {
    const v = await cache.get(key);
    if (!v) return null;
    return JSON.parse(v);
  } catch {
    return null;
  }
}

// Uniform response utility
function ok(res, data) {
  return res.status(200).json(data);
}

// ----------------------------------------------------------
// Base Route
// ----------------------------------------------------------
router.get("/", (_, res) => {
  res.status(200).send("⚽ Football Backend API Running");
});

// ----------------------------------------------------------
// Health
// ----------------------------------------------------------
router.get("/health", async (req, res) => {
  let redisOK = false;
  try { redisOK = cache.client && cache.client.status === "ready"; } catch {}
  ok(res, {
    status: "ok",
    redis: redisOK,
    time: Date.now()
  });
});

// ----------------------------------------------------------
// Fixtures (global schedule)
// ----------------------------------------------------------
router.get("/fixtures", async (req, res) => {
  const key = "fixtures";
  const cached = await getCache(key);
  if (cached) return ok(res, cached);

  const data = await runFixturesOnce();
  await cache.set(key, JSON.stringify(data), 600);
  ok(res, data);
});

// ----------------------------------------------------------
// LIVE matches (ScoreBat + OpenLigaDB)
// ----------------------------------------------------------
router.get("/live", async (req, res) => {
  const key = "live";
  const cached = await getCache(key);
  if (cached) return ok(res, cached);

  const data = await runLiveOnce();
  await cache.set(key, JSON.stringify(data), 30);
  ok(res, data);
});

// ----------------------------------------------------------
// Injuries – simple passthrough
// ----------------------------------------------------------
router.get("/injuries", async (req, res) => {
  try {
    const data = await injuries();
    ok(res, data);
  } catch {
    ok(res, []);
  }
});

// ----------------------------------------------------------
// Combined Endpoint – for mobile apps
// ----------------------------------------------------------
router.get("/data", async (req, res) => {
  try {
    const [fixtures, live, inj] = await Promise.all([
      getCache("fixtures").then(x => x || runFixturesOnce()),
      getCache("live").then(x => x || runLiveOnce()),
      injuries().catch(() => [])
    ]);

    ok(res, {
      fixtures,
      live,
      injuries: inj
    });
  } catch {
    ok(res, {
      fixtures: [],
      live: [],
      injuries: []
    });
  }
});

module.exports = router;
