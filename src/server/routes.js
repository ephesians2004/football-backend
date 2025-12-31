const express = require("express");
const router = express.Router();

const cache = require("../utils/cache");

const fotmob = require("../scrapers/fotmob");
const sportsdb = require("../scrapers/thesportsdb");
const scores365 = require("../scrapers/scores365");
const injuries = require("../scrapers/injuriesEspn");
const transfermarkt = require("../scrapers/transfermarkt");
const predictions = require("../scrapers/footystats");
const flashStats = require("../scrapers/flashscoreStats");
const { runFixturesOnce, runLiveOnce } = require("../cron/scrapeAll");

router.get("/", (req, res) => res.status(200).send("⚽ Football Backend API Running"));

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

/* Fixtures */
router.get("/fixtures", async (req, res) => {
  try {
    const key = "fixtures";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));

    const data = await runFixturesOnce();
    await cache.set(key, JSON.stringify(data), 600);
    res.json(data);

  } catch {
    res.json([]);
  }
});

/* Live */
router.get("/live", async (req, res) => {
  try {
    const key = "live";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));

    const data = await runLiveOnce();
    await cache.set(key, JSON.stringify(data), 60);
    res.json(data);

  } catch {
    res.json([]);
  }
});

/* Injuries */
router.get("/injuries", async (req, res) => {
  try { res.json(await injuries()); }
  catch { res.json([]); }
});

/* Transfermarkt squads + values */
router.get("/squads", async (_, res) => {
  try { res.json(await transfermarkt()); }
  catch { res.json([]); }
});

router.get("/value", async (_, res) => {
  try { res.json(await transfermarkt.getValues()); }
  catch { res.json([]); }
});

/* Predictions (AI weighted model) */
router.get("/predictions", async (req, res) => {
  try {
    const fixtures = await runFixturesOnce();
    const inj = await injuries();
    const values = await transfermarkt.getValues();
    res.json(await predictions(fixtures, inj, [], values));
  } catch {
    res.json([]);
  }
});

/* Flashscore live stats */
router.get("/stats/live", async (_, res) => {
  try { res.json(await flashStats()); }
  catch { res.json([]); }
});

/* Old combined legacy endpoint */
router.get("/data", async (req, res) => {
  try {
    const fixtures = await runFixturesOnce();
    const live = await runLiveOnce();
    const inj = await injuries();
    const pred = await predictions(fixtures, inj, [], []);
    const squad = await transfermarkt();
    const value = await transfermarkt.getValues();

    res.json({ fixtures, live, injuries: inj, predictions: pred, squads: squad, value });
  } catch {
    res.json({ fixtures: [], live: [], injuries: [], predictions: [], squads: [], value: [] });
  }
});

module.exports = router;
