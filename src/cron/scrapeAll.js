// src/cron/scrapeAll.js
const cache = require("../utils/cache");

const footballData = require("../scrapers/footballdata");
const fdProxy = require("../scrapers/footballdataProxy");
const scorebat = require("../scrapers/scorebat");
const openliga = require("../scrapers/openligadb");
const injuries = require("../scrapers/injuriesEspn");

function today() {
  return new Date().toISOString().split("T")[0];
}

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

    // filter → only today + next 7 days
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 86400000);

    list = list.filter(m => {
      if (!m.date) return false;
      const d = new Date(m.date);
      return d >= now && d <= nextWeek;
    });

    // dedupe
    const seen = new Set();
    list = list.filter(x => {
      const key = `${x.home}-${x.away}-${x.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return list.slice(0, 200);

  } catch (err) {
    console.log("⚠ runFixturesOnce error:", err.message);
    return [];
  }
}

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

    const now = Date.now();
    const fourHours = 4 * 60 * 60 * 1000;

    live = live.filter(m => {
      if (!m.date) return true;
      const t = new Date(m.date).getTime();
      return Math.abs(now - t) < fourHours;
    });

    return live.slice(0, 200);
  } catch (err) {
    console.log("⚠ runLiveOnce error:", err.message);
    return [];
  }
}

async function scrapeAll() {
  console.log("🔄 SCRAPE START");
  const fixtures = await runFixturesOnce();
  const live = await runLiveOnce();
  const inj = await injuries().catch(() => []);

  cache.set("fixtures", JSON.stringify(fixtures), 600);
  cache.set("live", JSON.stringify(live), 30);
  cache.set("injuries", JSON.stringify(inj), 600);

  console.log(`🏁 SCRAPE DONE | fixtures=${fixtures.length} | live=${live.length}`);
}

module.exports = { scrapeAll, runFixturesOnce, runLiveOnce };
