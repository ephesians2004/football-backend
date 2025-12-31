const axios = require("axios");

module.exports = async function oddsApi() {
  try {
    const API_KEY = process.env.ODDS_API_KEY;
    if (!API_KEY) return [];

    const url = `https://api.the-odds-api.com/v4/sports/soccer_epl/odds?regions=eu&markets=h2h&apiKey=${API_KEY}`;

    const r = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000
    });

    return r.data?.map(event => ({
      id: event.id,
      commence: event.commence_time,
      home: event.home_team,
      away: event.away_team,
      bookmakers: event.bookmakers?.map(b => ({
        name: b.title,
        odds: b.markets?.[0]?.outcomes
      }))
    })) ?? [];

  } catch (err) {
    console.log("⚠️ OddsAPI error:", err.response?.status, err.message);
    return [];
  }
};
