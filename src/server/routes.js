/**
 * API Routes – SAFE MODE (No crashes if scraper missing)
 */

const express = require("express");
const router = express.Router();
const cache = require("../utils/cache");

// Scrapers (wrapped safely)
const fotmob = safeRequire("../scrapers/fotmob");
const sportsdb = safeRequire("../scrapers/thesportsdb");
const scores365 = safeRequire("../scrapers/scores365");
const injuries = safeRequire("../scrapers/injuriesEspn");
const transfermarkt = safeRequire("../scrapers/transfermarkt");
const footystats = safeRequire("../scrapers/footystats");
const flashStats = safeRequire("../scrapers/flashscoreStats");

// Cron Aggregation
const { runFixturesOnce, runLiveOnce } = require("../cron/scrapeAll");

// Helper – module loader that never throws
function safeRequire(path) {
  try { return require(path); }
  catch (e) {
    console.log(`⚠️ Missing module: ${path}`);
    return async () => ([]);
  }
}

router.get("/", (req, res) => {
  res.status(200).send("⚽ Football Backend API Running");
});

// ---- HEALTH ----
router.get("/health", async (req, res) => {
  res.json({ status: "ok", redis: cache.isConnected(), time: Date.now() });
});

// ---- FIXTURES ----
router.get("/fixtures", async (req, res) => {
  try {
    const key = "fixtures";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));

    const data = await runFixturesOnce();
    await cache.set(key, JSON.stringify(data), 600);
    return res.json(data);
  } catch (err) {
    console.log("❌ Fixtures err:", err.message);
    return res.json([]);
  }
});

// ---- LIVE ----
router.get("/live", async (req, res) => {
  try {
    const key = "live";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));

    const data = await runLiveOnce();
    await cache.set(key, JSON.stringify(data), 30);
    return res.json(data);
  } catch (err) {
    console.log("❌ Live err:", err.message);
    return res.json([]);
  }
});

// ---- INJURIES ----
router.get("/injuries", async (req, res) => {
  try { return res.json(await injuries()); }
  catch { return res.json([]); }
});

// ---- SQUADS ----
router.get("/squads", async (_, res) => {
  try { return res.json(await transfermarkt()); }
  catch { return res.json([]); }
});

// ---- VALUE ----
router.get("/value", async (_, res) => {
  try { return res.json(await transfermarkt.getValues()); }
  catch { return res.json([]); }
});

// ---- AI PREDICTIONS ----
router.get("/predictions", async (req, res) => {
  try {
    const fixtures = await runFixturesOnce();
    const inj = await injuries();
    const values = await transfermarkt.getValues() ?? [];
    return res.json(await footystats(fixtures, inj, [], values));
  } catch (err) {
    console.log("❌ Prediction error:", err.message);
    return res.json([]);
  }
});

// ---- FLASHscore LIVE STATS ----
router.get("/stats/live", async (_, res) => {
  try { return res.json(await flashStats()); }
  catch { return res.json([]); }
});

// ---- LEGACY COMBINATION ENDPOINT ----
router.get("/data", async (req, res) => {
  try {
    const fixtures = await runFixturesOnce();
    const live = await runLiveOnce();
    const inj = await injuries();
    const squads = await transfermarkt();
    const value = await transfermarkt.getValues();
    const pred = await footystats(fixtures, inj, [], value);

    return res.json({ fixtures, live, injuries: inj, squads, value, predictions: pred });
  } catch (err) {
    console.log("❌ /data error:", err.message);
    return res.json({ fixtures: [], live: [], injuries: [], squads: [], value: [], predictions: [] });
  }
});

module.exports = router;
