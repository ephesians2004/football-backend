const axios = require("axios");

async function fetchOdds() {
  try {
    const API_KEY = process.env.ODDS_API_KEY;
    if (!API_KEY) return [];

    const url = `https://api.the-odds-api.com/v4/sports/soccer_epl/odds?regions=eu&markets=h2h&apiKey=${API_KEY}`;

    const r = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });

    return r.data ?? [];
  } catch (err) {
    console.log("⚠️ OddsAPI fetch error:", err.response?.status, err.message);
    return [];
  }
}

async function toMap() {
  const data = await fetchOdds();
  const map = {};

  for (const ev of data) {
    const home = ev.home_team;
    const away = ev.away_team;
    const id = ev.id;

    const odds = ev.bookmakers?.[0]?.markets?.[0]?.outcomes ?? [];

    const homeO = odds.find(o => o.name === home)?.price ?? null;
    const drawO = odds.find(o => o.name === "Draw")?.price ?? null;
    const awayO = odds.find(o => o.name === away)?.price ?? null;

    map[id] = { home: homeO, draw: drawO, away: awayO };
  }

  return map;
}

async function getOddsFor(matchId) {
  const map = await toMap();
  return map[matchId] ?? null;
}

module.exports = { fetch: fetchOdds, toMap, getOddsFor };
