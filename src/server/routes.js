const express = require("express");
const router = express.Router();
const { getCacheSnapshot } = require("../cron/scrapeAll");

// Individual clean endpoints
router.get("/fixtures", (req, res) =>
  res.json(getCacheSnapshot("fixtures") || [])
);

router.get("/live", (req, res) =>
  res.json(getCacheSnapshot("live") || [])
);

router.get("/injuries", (req, res) =>
  res.json(getCacheSnapshot("injuries") || [])
);

router.get("/predictions", (req, res) =>
  res.json(getCacheSnapshot("predictions") || [])
);

router.get("/squads", (req, res) =>
  res.json(getCacheSnapshot("squads") || [])
);

router.get("/value", (req, res) =>
  res.json(getCacheSnapshot("value") || [])
);

// Combined legacy endpoint
router.get("/data", (req, res) => {
  res.json({
    fixtures: getCacheSnapshot("fixtures"),
    live: getCacheSnapshot("live"),
    injuries: getCacheSnapshot("injuries"),
    predictions: getCacheSnapshot("predictions"),
    squads: getCacheSnapshot("squads"),
    value: getCacheSnapshot("value")
  });
});

module.exports = router;
