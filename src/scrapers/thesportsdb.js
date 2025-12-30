/**
 * API-Football – Fixtures (Direct API)
 * Docs: https://www.api-football.com/documentation
 */

const axios = require("axios");
const KEY = process.env.API_FOOTBALL_KEY;

module.exports = async function scrapeApiFootball() {
  if (!KEY) {
    console.log("⚠️ Missing API_FOOTBALL_KEY");
    return [];
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const r = await axios.get(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          "x-apisports-key": KEY,
          "User-Agent": "Mozilla/5.0"
        },
        timeout: 10000
      }
    );

    const arr = r.data?.response || [];
    return arr.map(x => ({
      id: x.fixture?.id,
      home: x.teams?.home?.name,
      away: x.teams?.away?.name,
      timestamp: x.fixture?.timestamp * 1000,
      league: x.league?.name,
      country: x.league?.country,
      venue: x.fixture?.venue?.name,
      status: x.fixture?.status?.short,
      logoHome: x.teams?.home?.logo,
      logoAway: x.teams?.away?.logo,
      round: x.league?.round,
    }));

  } catch (e) {
    console.log("⚠️ API-Football error", e.message);
    return [];
  }
};
