/**
 * scrapeAll() — pulls data from all providers
 * and merges into final arrays
 */

const fotmob = require("../scrapers/fotmob");
const apiFootball = require("../scrapers/apiFootball");
const sportsdb = require("../scrapers/thesportsdb");
const scores365 = require("../scrapers/scores365");
const oddsapi = require("../scrapers/oddsapi");
const flashStats = require("../scrapers/flashscoreLive");   // basic live only
const injuries = require("../scrapers/injuriesEspn");
const cache = require("../utils/cache");

// ---------------- RUN FIXTURES ONE TIME ---------------- //
async function runFixturesOnce() {
  try {
    const [fm, api, tdb, sc365, oddsRaw] = await Promise.allSettled([
      fotmob(),
      apiFootball(),
      sportsdb(),
      scores365(),
      oddsapi()
    ]);

    let base = [
      ...(fm.value || []),
      ...(api.value || []),
      ...(tdb.value || []),
      ...(sc365.value || [])
    ];

    base = base.slice(0, 200);

    // attach odds
    const map = oddsapi.toMap(oddsRaw.value || []);
    const fixtures = base.map(fix => {
      const key = `${fix.home} vs ${fix.away}`;
      return {
        ...fix,
        odds: map[key] || null
      };
    });

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
      flashStats(),                 // only flashscore line-based feed
      require("../scrapers/flashscoreStats")() // extra stats
    ]);

    const live = basic.value || [];
    const ext = stats.value || [];

    const map = {};
    ext.forEach(row => map[row.id] = row);

    const merged = live.map(item => ({
      ...item,
      stats: map[item.id] || null
    }));

    return merged;
  } catch (e) {
    console.log("⚠️ runLiveOnce error:", e.message);
    return [];
  }
}

// ---------------- FULL TRIGGER FOR CRON ---------------- //
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
