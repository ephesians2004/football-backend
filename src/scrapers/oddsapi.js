const axios = require("axios");
const KEY = process.env.ODDS_API_KEY;   // MUST be set in Railway env

// Fetch betting odds for soccer fixtures
module.exports = async function(){
  if (!KEY) {
    console.log("⚠️ ODDS_API_KEY missing");
    return [];
  }

  try {
    const r = await axios.get(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h,btts,totals&apiKey=${KEY}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        },
        timeout: 10000
      }
    );

    const events = r.data || [];

    return events.map(ev => ({
      id: ev.id,
      home: ev.home_team,
      away: ev.away_team,
      bookmakers: ev.bookmakers?.map(b => ({
        name: b.key,
        markets: b.markets
      })) || []
    }));

  } catch (e) {
    console.log("⚠️ Odds API error:", e.message);
    return [];
  }
};

// Convert odds list into a lookup table: "Home vs Away" => oddsObject
module.exports.toMap = function(oddsList) {
  const map = {};
  oddsList.forEach(ev => {
    const key = `${ev.home} vs ${ev.away}`;
    const book = ev.bookmakers?.[0];

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
};
