const cache = require("../utils/cache");

// Scrapers
const fotmob = require("../scrapers/fotmob");
const scores365 = require("../scrapers/scores365");
const sportsdb = require("../scrapers/thesportsdb");
const openliga = require("../scrapers/openligadb");
const scorebat = require("../scrapers/scorebat");
const injuries = require("../scrapers/injuriesEspn");

/**
 * Run fixtures scrapers once
 * Returns a merged array of fixtures
 */
async function runFixturesOnce() {
  try {
    const [fm, sc365, tdb, ol] = await Promise.allSettled([
      fotmob(),
      scores365(),
      sportsdb(),
      openliga.getFixtures()
    ]);

    let fixtures = [
      ...(fm.value || []),
      ...(sc365.value || []),
      ...(tdb.value || []),
      ...(ol.value || [])
    ];

    return fixtures.slice(0, 200);
  } catch (err) {
    console.log("⚠️ runFixturesOnce ERROR:", err.message);
    return [];
  }
}

/**
 * Run Live scrapers once
 * Uses ScoreBat + OpenLiga fallback
 */
async function runLiveOnce() {
  try {
    const [scorebatRes, ol] = await Promise.allSettled([
      scorebat.getLive(),
      openliga.getLive()
    ]);

    return [
      ...(scorebatRes.value || []),
      ...(ol.value || [])
    ];
  } catch (err) {
    console.log("⚠️ runLiveOnce ERROR:", err.message);
    return [];
  }
}

/**
 * CRON — full scrape + save to Redis
 */
async function scrapeAll() {
  console.log("🔄 SCRAPE START");

  const fixtures = await runFixturesOnce();
  const live = await runLiveOnce();
  const inj = await injuries();

  try {
    await cache.set("fixtures", JSON.stringify(fixtures), 600);
    await cache.set("live", JSON.stringify(live), 60);
    await cache.set("injuries", JSON.stringify(inj), 300);
  } catch (e) {
    console.log("⚠️ Redis Cache ERROR:", e.message);
  }

  console.log("🏁 SCRAPE DONE");
}

module.exports = {
  scrapeAll,
  runFixturesOnce,
  runLiveOnce
};
