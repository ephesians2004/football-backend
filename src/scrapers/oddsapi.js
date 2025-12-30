/**
 * TheOddsAPI – Odds data for Soccer
 * Docs: https://the-odds-api.com/liveapi/
 *
 * Returned markets:
 * - h2h (Home / Draw / Away)
 * - btts (Both Teams To Score)
 * - totals (Over/Under 2.5 goals)
 */

const axios = require("axios");
const KEY = process.env.ODDS_API_KEY;

async function fetchOdds() {
  if (!KEY) {
    console.log("⚠️ Missing ODDS_API_KEY");
    return [];
  }

  try {
    const r = await axios.get(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h,btts,totals&apiKey=${KEY}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json"
        },
        timeout: 10000
      }
    );

    return r.data || [];

  } catch (e) {
    console.log("⚠️ OddsAPI error:", e.message);
    return [];
  }
}

// Convert array → lookup: "Home vs Away" => { odds }
function convertToMap(list) {
  const map = {};

  list.forEach(ev => {
    const key = `${ev.home_team} vs ${ev.away_team}`;

    const book = ev.bookmakers?.[0]; // first bookmaker only
    if (!book) return;

    const markets = book.markets;

    const h2h = markets.find(m => m.key === "h2h");
    const totals = markets.find(m => m.key === "totals");
    const btts = markets.find(m => m.key === "btts");

    map[key] = {
      home: h2h?.outcomes?.[0]?.price ?? null,
      away: h2h?.outcomes?.[1]?.price ?? null,
      draw: h2h?.outcomes?.[2]?.price ?? null,
      over25: totals?.outcomes?.find(o => o.name === "Over 2.5")?.price ?? null,
      btts: btts?.outcomes?.find(o => o.name === "Yes")?.price ?? null
    };
  });

  return map;
}

module.exports = async function() {
  return await fetchOdds();
};

module.exports.toMap = function(list) {
  return convertToMap(list);
};
