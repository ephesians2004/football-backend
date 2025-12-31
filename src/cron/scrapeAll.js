/**
 * scrapeAll() — pulls data from all providers
 * and merges into final arrays
 */

const fotmob = require("../scrapers/fotmob");
const apiFootball = require("../scrapers/apiFootball");
const sportsdb = require("../scrapers/thesportsdb");
const scores365 = require("../scrapers/scores365");
const oddsapi = require("../scrapers/oddsapi");          // FIX: use .toMap()
const flashStats = require("../scrapers/flashscoreLive");
const injuries = require("../scrapers/injuriesEspn");
const cache = require("../utils/cache");

// ---------------- RUN FIXTURES ONE TIME ---------------- //
async function runFixturesOnce() {
  try {
    const [fm, api, tdb, sc365] = await Promise.allSettled([
      fotmob(),
      apiFootball(),
      sportsdb(),
      scores365()
    ]);

    let base = [
      ...(fm.value || []),
      ...(api.value || []),
      ...(tdb.value || []),
      ...(sc365.value || [])
    ];

    base = base.slice(0, 200);

    // ---- ODDS ATTACH FIX ----
    const oddsMap = await oddsapi.toMap();      // FIXED
    const fixtures = base.map(fix => ({
      ...fix,
      odds: oddsMap[fix.id] || oddsMap[`${fix.home} vs ${fix.away}`] || null
    }));

    return fixtures;

  } catch (e) {
    console.log("⚠️ runFixturesOnce error:", e.message);
    return [];
  }
}

// ---------------- RUN LIVE SCORES ONE TIME ---------------- //
async function runLiveOnce() {
  try {
    const [basic, stats] = await Promise.allSettled([
      flashStats(),
      require("../scrapers/flashscoreStats")()
    ]);

    const live = basic.value || [];
    const ext = stats.value || [];

    const map = {};
    ext.forEach(r => map[r.id] = r);

    return live.map(row => ({
      ...row,
      stats: map[row.id] || null
    }));

  } catch (e) {
    console.log("⚠️ runLiveOnce error:", e.message);
    return [];
  }
}

// ---------------- FULL CRON TRIGGER ---------------- //
async function scrapeAll() {
  console.log("🔄 SCRAPE START");
  const f = await runFixturesOnce();
  const i = await injuries();
  const l = await runLiveOnce();
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
