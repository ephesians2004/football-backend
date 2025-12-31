const footballData = require("../scrapers/footballdata");
const openliga = require("../scrapers/openligadb");
const scorebat = require("../scrapers/scorebat");
const predict = require("../predictions/model");
const cache = require("../utils/cache");

async function runFixtures() {
  let main = await footballData();
  if (!main || main.length === 0) {
    console.log("⚠️ fallback: Football-Data empty → using OpenLigaDB");
    main = await openliga.getFixtures();
  }
  return main;
}

async function runLive() {
  return await scorebat.getLive() || [];
}

async function scrapeAll() {
  console.log("⏳ scrape start");
  const fixtures = await runFixtures();
  const live = await runLive();
  cache.set("fixtures", JSON.stringify(fixtures), 600);
  cache.set("live", JSON.stringify(live), 30);
  console.log("✔ scrape done");
}

module.exports = { scrapeAll, runFixtures, runLive };
