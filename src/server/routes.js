// src/server/routes.js
const express = require("express");
const router = express.Router();
const cache = require("../utils/cache");
const { runFixturesOnce, runLiveOnce } = require("../cron/scrapeAll");
const injuries = require("../scrapers/injuriesEspn");

router.get("/", (_, res) => res.send("⚽ Football Backend Running"));

router.get("/health", async (_, res) => {
  const redisOk = cache.client && cache.client.status === "ready";
  res.json({ status: "ok", redis: redisOk, time: Date.now() });
});

router.get("/fixtures", async (_, res) => {
  try {
    const key = "fixtures";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));

    const data = await runFixturesOnce();
    await cache.set(key, JSON.stringify(data), 600);
    return res.json(data);
  } catch {
    return res.json([]);
  }
});

router.get("/live", async (_, res) => {
  try {
    const key = "live";
    const cached = await cache.get(key);
    if (cached) return res.json(JSON.parse(cached));

    const data = await runLiveOnce();
    await cache.set(key, JSON.stringify(data), 30);
    return res.json(data);
  } catch {
    return res.json([]);
  }
});

router.get("/injuries", async (_, res) => {
  try { return res.json(await injuries()); }
  catch { return res.json([]); }
});

router.get("/data", async (_, res) => {
  try {
    const fixtures = await runFixturesOnce();
    const live = await runLiveOnce();
    const inj = await injuries();

    return res.json({ fixtures, live, injuries: inj });
  } catch {
    return res.json({ fixtures: [], live: [], injuries: [] });
  }
});

module.exports = router;
