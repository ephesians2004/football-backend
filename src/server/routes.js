const express = require('express');
const router = express.Router();
const { latestData } = require('../cron/scrapeAll');

router.get('/data', (_req,res)=>res.json(latestData()));

module.exports = router;
