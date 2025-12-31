/**
 * Express API Routes – crash-proof, safe-require enabled
 */

const express = require("express");
const router = express.Router();
const cache = require("../utils/cache");

// Helper: require module safely
function safeRequire(path) {
  try { return require(path); }
  catch (e) {
    console.log(`⚠️ Missing module: ${path}`);
    return async () => ([]);
  }
}

// Scrapers (never crash)
const fotmob = safeRequire("../scrapers/fotmob");
const sportsdb = safeRequire("../scrapers/thesportsdb");
const scores365 = safeRequire("../scrapers/scores365");
const injuries = safeRequire("../scrapers/injuriesEspn");
const transfermarkt = safeRequire("../scrapers/transfermarkt");
const footystats = safeRequire("../scrapers/footystats");
const flashStats = safeRequire("../scrapers/flashscoreStats");

// Aggregation (cron)
const { runFixturesOnce, runLiveOnce } = require("../cron/scrapeAll");

router.get("/", (req, res) => {
  res.status(200).send("⚽ Football Backend API Running");
});

// ---- HEALTH ----
router.get("/health", async (req, res) => {
  try {
    const redisOk =
      cache.client &&
      (cache.client.status === "ready" || cache.client.connected === true);

    return res.json({
      status: "ok",
      redis: redisOk,
      time: Date.now()
    });
  } catch {
    return res.json({ status: "ok", redis: false, time: Date.now() });
  }
});

// ---- FIXTURES ----
router.get("/fixtures", async (req, res) => {
  try {
    const key = "fixtures";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));

    const data = await runFixturesOnce();
    await cache.set(key, JSON.stringify(data), 600);
    res.json(data);

  } catch (err) {
    console.log("❌ Fixtures error:", err.message);
    res.json([]);
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
    res.json(data);

  } catch (err) {
    console.log("❌ Live error:", err.message);
    res.json([]);
  }
});

// ---- INJURIES ----
router.get("/injuries", async (req, res) => {
  try { res.json(await injuries()); }
  catch { res.json([]); }
});

// ---- SQUADS ----
router.get("/squads", async (req, res) => {
  try { res.json(await transfermarkt()); }
  catch { res.json([]); }
});

// ---- VALUE ----
router.get("/value", async (req, res) => {
  try { res.json(await transfermarkt.getValues()); }
  catch { res.json([]); }
});

// ---- AI PREDICTIONS ----
router.get("/predictions", async (req, res) => {
  try {
    const fixtures = await runFixturesOnce();
    const inj = await injuries();
    const values = await transfermarkt.getValues() ?? [];
    res.json(await footystats(fixtures, inj, [], values));
  } catch (err) {
    console.log("❌ Prediction error:", err.message);
    res.json([]);
  }
});

// ---- FLASHscore STATS ----
router.get("/stats/live", async (req, res) => {
  try { res.json(await flashStats()); }
  catch { res.json([]); }
});

// ---- LEGACY ----
router.get("/data", async (req, res) => {
  try {
    const fixtures = await runFixturesOnce();
    const live = await runLiveOnce();
    const inj = await injuries();
    const squads = await transfermarkt();
    const value = await transfermarkt.getValues();
    const pred = await footystats(fixtures, inj, [], value);

    res.json({ fixtures, live, injuries: inj, squads, value, predictions: pred });
  } catch (err) {
    console.log("❌ /data ERROR:", err.message);
    res.json({
      fixtures: [], live: [], injuries: [],
      squads: [], value: [], predictions: []
    });
  }
});

module.exports = router;
