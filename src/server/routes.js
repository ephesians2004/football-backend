const express = require("express");
const router = express.Router();

// scrapers
const fotmob = require("../scrapers/fotmob");
const apiFootball = require("../scrapers/apiFootball");
const sportsdb = require("../scrapers/thesportsdb");
const scores365 = require("../scrapers/scores365");
const oddsapi = require("../scrapers/oddsapi");
const injuries = require("../scrapers/injuriesEspn");
const transfermarkt = require("../scrapers/transfermarkt");
const flashStats = require("../scrapers/flashscoreStats");
const predictions = require("../scrapers/footystats");

// cache singleton
const cache = require("../utils/cache");

/* ---------------- HEALTH ---------------- */
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

/* ---------------- DATA ------------------- */
router.get("/fixtures", async (req, res) => {
  try {
    const key = "fixtures";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));
    const data = await require("../cron/scrapeAll").runFixturesOnce();
    cache.set(key, JSON.stringify(data), 600);
    res.json(data);
  } catch (e) {
    res.json([]);
  }
});

router.get("/live", async (req, res) => {
  try {
    const key = "live";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));
    const data = await require("../cron/scrapeAll").runLiveOnce();
    cache.set(key, JSON.stringify(data), 60);
    res.json(data);
  } catch (e) {
    res.json([]);
  }
});

router.get("/injuries", async (req, res) => {
  try {
    res.json(await injuries());
  } catch {
    res.json([]);
  }
});

router.get("/squads", async (req, res) => {
  try {
    res.json(await transfermarkt());
  } catch {
    res.json([]);
  }
});

router.get("/value", async (req, res) => {
  try {
    res.json(await transfermarkt.getValues());
  } catch {
    res.json([]);
  }
});

/* -------------- EXTENDED LIVE STATS --------- */
router.get("/stats/live", async (req, res) => {
  try { res.json(await flashStats()); }
  catch { res.json([]); }
});

/* -------------- PREDICTIONS ------------------ */
router.get("/predictions", async (req, res) => {
  try { res.json(await predictions()); }
  catch { res.json([]); }
});

/* -------------- LEGACY COMBINED -------------- */
router.get("/data", async (req, res) => {
  try {
    const fixtures = await require("../cron/scrapeAll").runFixturesOnce();
    const live = await require("../cron/scrapeAll").runLiveOnce();
    const inj = await injuries();
    const pred = await predictions();
    const squad = await transfermarkt();
    const value = await transfermarkt.getValues();

    res.json({
      fixtures,
      live,
      injuries: inj,
      predictions: pred,
      squads: squad,
      value
    });

  } catch (e) {
    res.json({ fixtures: [], live: [], injuries: [], predictions: [], squads: [], value: [] });
  }
});

/* ---------------- EXPORT --------------------- */
module.exports = router;
