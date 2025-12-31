const express = require("express");
const router = express.Router();
const cache = require("../utils/cache");
const predict = require("../predictions/model");
const { runFixtures, runLive } = require("./scraperInit");

router.get("/", (_,res)=> res.send("⚽ Backend OK"));
router.get("/health", (_,res)=> res.json({ok:true,time:Date.now()}));

router.get("/fixtures", async (req,res)=>{
  const c = await cache.get("fixtures");
  if (c) return res.json(JSON.parse(c));
  const d = await runFixtures();
  await cache.set("fixtures", JSON.stringify(d), 600);
  res.json(d);
});

router.get("/live", async (req,res)=>{
  const c = await cache.get("live");
  if (c) return res.json(JSON.parse(c));
  const d = await runLive();
  await cache.set("live", JSON.stringify(d), 30);
  res.json(d);
});

router.get("/predictions", async (req,res)=>{
  const fixtures = JSON.parse(await cache.get("fixtures") || "[]");
  res.json(predict(fixtures));
});

router.get("/data", async (req,res)=>{
  const f = JSON.parse(await cache.get("fixtures") || "[]");
  const l = JSON.parse(await cache.get("live") || "[]");
  res.json({fixtures:f, live:l, predictions: predict(f)});
});

module.exports = router;
