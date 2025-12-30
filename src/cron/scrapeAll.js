const fotmob = require('../scrapers/fotmob');
const espn = require('../scrapers/espn');
const sofascore = require('../scrapers/sofascore');
const scores365 = require('../scrapers/scores365');
const apiFootball = require('../scrapers/apifootball');
const sportsdb = require('../scrapers/thesportsdb');

let _data = {
  fixtures: [],
  live: [],
  injuries: [],
  predictions: [],
  squads: []
};

async function safeScrape(){
  console.log("🔄 SCRAPE START");
  try {
    const [
      fm, 
      esp, 
      sofaLive, 
      sc365,
      apiFix,
      tdbFix
    ] = await Promise.allSettled([
      fotmob(),
      espn(),
      sofascore(),
      scores365(),
      apiFootball(),
      sportsdb()
    ]);

    // merge fixtures from strongest sources
    const fixtures = [
      ...(fm.value || []),
      ...(apiFix.value || []),
      ...(tdbFix.value || []),
      ...(sc365.value || []),
    ].slice(0, 200); // limit to avoid overload

    _data = {
      fixtures,
      live: sofaLive.value || [],
      injuries: esp.value || [],
      predictions: [],
      squads: []
    };

    console.log("🏁 SCRAPE DONE");
  } catch (e) {
    console.log("❌ SCRAPE ERROR", e.message);
  }
}

function latestData(){ return _data; }

module.exports = { safeScrape, latestData };
