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
    const f = await fotmob();
    _data.fixtures = f;
  }catch(e){}
}

function latestData(){ return _data; }

module.exports = { safeScrape, latestData };
