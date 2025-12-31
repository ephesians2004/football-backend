/**
 * scrapeAll.js – Central cron + merge logic
 */
const cache = require("../utils/cache");

// SAFE LOADER (protects against missing scraper files)
function safeRequire(path) {
  try { return require(path); }
  catch (e) {
    console.log(`⚠️ Missing module (ignored): ${path}`);
    return { getFixtures: async () => [], getLive: async () => [] };
  }
}

// Scrapers
const footballData = safeRequire("../scrapers/footballdata");
const fdProxy = safeRequire("../scrapers/footballdataProxy");
const scorebat = safeRequire("../scrapers/scorebat");
const openliga = safeRequire("../scrapers/openligadb");
const injuries = safeRequire("../scrapers/injuriesEspn");

// ----------------------------------------------------------
// FIXTURES – Primary + Proxy Fallback
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

    // Remove duplicates
    const seen = new Set();
    list = list.filter(x => {
      const key = `${x.home}-${x.away}-${x.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Filter future ≤ 7 days
    const now = new Date();
    const weekAhead = new Date(Date.now() + 7 * 86400000);

    list = list.filter(m => {
      const d = new Date(m.date);
      return d >= now && d <= weekAhead;
    });

    return list.slice(0, 200);
  } catch (e) {
    console.log("⚠️ runFixturesOnce error:", e.message);
    return [];
  }
}

// ----------------------------------------------------------
// LIVE SCORES – ScoreBat + OpenLiga fallback
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

    // Filter → ± 4 hours window
    const now = Date.now();
    const oneHr = 60 * 60 * 1000;
    live = live.filter(m => {
      if (!m.date) return true;
      const t = new Date(m.date).getTime();
      return Math.abs(now - t) < oneHr * 4;
    });

    return live.slice(0, 200);
  } catch (e) {
    console.log("⚠️ runLiveOnce error:", e.message);
    return [];
  }
}

// ----------------------------------------------------------
// CRON – save to Redis
// ----------------------------------------------------------
async function scrapeAll() {
  console.log("🔄 SCRAPE START");

  const fixtures = await runFixturesOnce();
  const live = await runLiveOnce();
  const inj = await injuries.get?.().catch?.(() => []) ?? [];

  cache.set("fixtures", JSON.stringify(fixtures), 600);
  cache.set("live", JSON.stringify(live), 30);
  cache.set("injuries", JSON.stringify(inj), 600);

  console.log(`🏁 SCRAPE DONE | fixtures=${fixtures.length} | live=${live.length}`);
}

module.exports = {
  scrapeAll,
  runFixturesOnce,
  runLiveOnce
};
