const axios = require("axios");

module.exports = async function flashscoreLive() {
  try {
    const url = "https://www.flashscore.com.ua/flashscore-data/football_live.json";
    
    const r = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 8000
    });

    const games = r.data?.events ?? [];
    return games.map(ev => ({
      id: ev.id,
      home: ev.home?.name,
      away: ev.away?.name,
      score: ev.ss,
      minute: ev.t,
      league: ev.lg?.name,
      country: ev.lg?.ccode,
      status: ev.st
    }));

  } catch (err) {
    console.log("⚠️ FlashScore LIVE error:", err.response?.status, err.message);
    return [];
  }
};
