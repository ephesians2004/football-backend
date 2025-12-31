const fotmob = require("../scrapers/fotmob");          // fixtures multiplier
const sportsdb = require("../scrapers/thesportsdb");
const scores365 = require("../scrapers/scores365");
const bbcLive = require("../scrapers/bbcLive");
const injuries = require("../scrapers/injuriesEspn");
const oddsapi = require("../scrapers/oddsapi");
const cache = require("../utils/cache");

// ---------------- FIXTURES ---------------- //
async function runFixturesOnce() {
  try {
    const [fm, tdb] = await Promise.allSettled([
      fotmob(),
      sportsdb()
    ]);

    let base = [
      ...(fm.value || []),
      ...(tdb.value || [])
    ];

    const odds = await oddsapi.toMap();
    base = base.map(row => ({
      ...row,
      odds: odds[row.id] || null
    }));

    return base.slice(0, 200);
  } catch (err) {
    console.log("⚠️ runFixturesOnce error:", err.message);
    return [];
  }
}

// ---------------- LIVE ---------------- //
async function runLiveOnce() {
  try {
    const [live365, liveBBC] = await Promise.allSettled([
      scores365(),
      bbcLive()
    ]);

    const live = [...(live365.value || []), ...(liveBBC.value || [])];
    return live.slice(0, 150);
  } catch (err) {
    console.log("⚠️ runLiveOnce error:", err.message);
    return [];
  }
}

// ---------------- CRON CORE ---------------- //
async function scrapeAll() {
  console.log("🔄 SCRAPE START");

  const f = await runFixturesOnce();
  const l = await runLiveOnce();
  const i = await injuries();

  cache.set("fixtures", JSON.stringify(f), 600);
  cache.set("live", JSON.stringify(l), 60);
  cache.set("injuries", JSON.stringify(i), 300);

  console.log("🏁 SCRAPE DONE");
}

module.exports = {
  scrapeAll,
  runFixturesOnce,
  runLiveOnce
};
