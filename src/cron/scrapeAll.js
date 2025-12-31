/**
 * scrapeAll.js – Central cron + merge logic
 *
 * Runs:
 *  - Fixtures (FootballData → fallback → merged)
 *  - Live matches (ScoreBat → OpenLigaDB)
 *  - Injuries (ESPN, fallback-safe)
 *  - Saves results to Redis cache
 */

const cache = require("../utils/cache");

// Scrapers
const footballData = require("../scrapers/footballdata");
const fdProxy = require("../scrapers/footballdataProxy");
const scorebat = require("../scrapers/scorebat");
const openliga = require("../scrapers/openligadb");
const injuries = require("../scrapers/injuriesEspn");

// Normalize date → YYYY-MM-DD
function today() {
  return new Date().toISOString().split("T")[0];
}

// ----------------------------------------------------------
// FIXTURES (Primary + fallback)
// ----------------------------------------------------------
async function runFixturesOnce() {
  try {
    const [fd, fdBackup] = await Promise.allSettled([
      footballData.getFixtures(),
      fdProxy.getFixtures()
    ]);

    let list = [
      ...(fd.value || []),
      ...(fdBackup.value || [])
    ];

    // Remove duplicates by match key
    const seen = new Set();
    list = list.filter(x => {
      const key = `${x.home}-${x.away}-${x.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // filter → only today + future within 7 days
    const dateNow = new Date();
    const weekAhead = new Date(Date.now() + 7 * 86400000);

    list = list.filter(m => {
      const d = new Date(m.date);
      return d >= dateNow && d <= weekAhead;
    });

    // Hard cap
    return list.slice(0, 200);

  } catch (e) {
    console.log("⚠️ runFixturesOnce error:", e.message);
    return [];
  }
}

// ----------------------------------------------------------
// LIVE SCORES (Multi-fallback + filter to now)
// ----------------------------------------------------------
async function runLiveOnce() {
  try {
    const [sb, ol] = await Promise.allSettled([
      scorebat.getLive(),
      openliga.getLive()
    ]);

    let live = [
      ...(sb.value || []),
      ...(ol.value || [])
    ];

    if (live.length === 0) return [];

    // filter – only matches close to current time
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    live = live.filter(m => {
      if (!m.date) return true;
      const t = new Date(m.date).getTime();
      return Math.abs(now - t) < oneHour * 4; // 4-hour radius window
    });

    // Hard cap
    return live.slice(0, 200);

  } catch (e) {
    console.log("⚠️ runLiveOnce error:", e.message);
    return [];
  }
}

// ----------------------------------------------------------
// CRON FULL TRIGGER
// ----------------------------------------------------------
async function scrapeAll() {
  console.log("🔄 SCRAPE START");
  
  const fixtures = await runFixturesOnce();
  const live = await runLiveOnce();
  const inj = await injuries().catch(() => []);

  // Write → Redis
  cache.set("fixtures", JSON.stringify(fixtures), 600); // refresh 10 min
  cache.set("live", JSON.stringify(live), 30);          // refresh 30 sec
  cache.set("injuries", JSON.stringify(inj), 600);

  console.log(`🏁 SCRAPE DONE | fixtures=${fixtures.length} | live=${live.length}`);
}

module.exports = {
  scrapeAll,
  runFixturesOnce,
  runLiveOnce
};
