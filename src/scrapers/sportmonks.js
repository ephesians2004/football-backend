const axios = require("axios");
const KEY = process.env.SPORTMONKS_KEY;

module.exports = async function(){
  if (!KEY) {
    console.log("⚠️ SportMonks KEY missing");
    return [];
  }

  try {
    const r = await axios.get(
      `https://api.sportmonks.com/v3/football/fixtures?api_token=${KEY}&include=scores;league;participants&per_page=200`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        },
        timeout: 10000
      }
    );

    const rows = r?.data?.data || [];

    return rows.map(ev => ({
      id: ev.id,
      league: ev.league?.name,
      leagueId: ev.league?.id,
      home: ev.participants?.find(x=>x.meta?.location === "home")?.name,
      away: ev.participants?.find(x=>x.meta?.location === "away")?.name,
      timestamp: ev.starting_at_timestamps?.utc,
      status: ev.state?.name
    }));
  } catch (e) {
    console.log("⚠️ SportMonks blocked:", e.message);
    return [];
  }
};
