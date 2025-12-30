const fotmob = require('../scrapers/fotmob');

let _data = {
  fixtures: [],
  live: [],
  injuries: [],
  predictions: [],
  squads: []
};

async function safeScrape(){
  try{
    const fixtures = await fotmob();
    _data.fixtures = fixtures;
  } catch (e) {
    console.log("FotMob scrape failed:", e.message);
  }
}

function latestData(){ return _data; }

module.exports = { safeScrape, latestData };
