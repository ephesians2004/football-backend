const cache = require("../utils/cache");

const fotmob = require("../scrapers/fotmob");
const scores365 = require("../scrapers/scores365");
const sportsdb = require("../scrapers/thesportsdb");
const openliga = require("../scrapers/openligadb");
const scorebat = require("../scrapers/scorebat");
const injuries = require("../scrapers/injuriesEspn");

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
  } catch {
    return [];
  }
}

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
  } catch {
    return [];
  }
}

async function scrapeAll() {
  console.log("🔄 SCRAPE START");
  const fixtures = await runFixturesOnce();
  const live = await runLiveOnce();
  const inj = await injuries();

  cache.set("fixtures", JSON.stringify(fixtures), 600);
  cache.set("live", JSON.stringify(live), 60);
  cache.set("injuries", JSON.stringify(inj), 300);

  console.log("🏁 SCRAPE DONE");
}

module.exports = { scrapeAll, runFixturesOnce, runLiveOnce };
