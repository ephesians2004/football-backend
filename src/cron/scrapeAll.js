const fotmob = require("../scrapers/fotmob");
const espn = require("../scrapers/espn");
const sofascore = require("../scrapers/sofascore");
const scores365 = require("../scrapers/scores365");
const apiFootball = require("../scrapers/apifootball");
const sportsdb = require("../scrapers/thesportsdb");

const flashscore = require("../scrapers/flashscore");
const onefootball = require("../scrapers/onefootball");
const sportmonks = require("../scrapers/sportmonks");
const transfermarkt = require("../scrapers/transfermarkt");
const footystats = require("../scrapers/footystats");

// Memory cache (later we will add Redis adapter)
let CACHE = {
  fixtures: [],
  live: [],
  injuries: [],
  predictions: [],
  squads: [],
  value: [],
};

// update category safely (never overwrite with empty unless startup)
function updateCache(category, payload) {
  if (!payload) return;
  if (Array.isArray(payload) && payload.length === 0 && CACHE[category]?.length > 0) {
    console.log(`⚠ preserved old ${category} cache (new scrape empty)`);
    return;
  }
  CACHE[category] = payload;
}

// returns cached category
function getCacheSnapshot(category) {
  return CACHE[category] || [];
}

// helper delay
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// scrape a single category
async function scrapeCategory(category) {
  try {
    console.log(`🔶 scraping category: ${category}`);

    let data = [];

    switch (category) {
      case "fixtures":
        const [fm, api, tdb, sc365] = await Promise.allSettled([
          fotmob(),
          apiFootball(),
          sportsdb(),
          scores365()
        ]);

        data = [
          ...(fm.value || []),
          ...(api.value || []),
          ...(tdb.value || []),
          ...(sc365.value || []),
        ].slice(0, 200);
        break;

      case "live":
        const [sf, fs] = await Promise.allSettled([
          sofascore(),
          flashscore()
        ]);
        data = [
          ...(sf.value || []),
          ...(fs.value || [])
        ].slice(0, 100);
        break;

      case "injuries":
        const esp = await espn();
        data = esp || [];
        break;

      case "predictions":
        const ft = await footystats();
        data = ft || [];
        break;

      case "squads":
        const sq = await transfermarkt();
        data = sq || [];
        break;

      case "value":
        const vm = await transfermarkt.getValues();
        data = vm || [];
        break;
    }

    updateCache(category, data);
    console.log(`🟢 updated ${category} | count=${data.length}`);
    await wait(250); // protect Railway CPU

  } catch (err) {
    console.log(`❌ scrape failed for ${category}:`, err.message);
  }
}

// preload on server startup
async function preloadStartup() {
  console.log("🚀 Startup warm-cache begin");
  await scrapeCategory("fixtures");
  await scrapeCategory("live");
  await scrapeCategory("injuries");
  await scrapeCategory("predictions");
  await scrapeCategory("squads");
  await scrapeCategory("value");
  console.log("🔥 Startup warm-cache done");
}

module.exports = {
  scrapeCategory,
  preloadStartup,
  getCacheSnapshot
};
