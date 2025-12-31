const axios = require("axios");

module.exports = async function fotmob() {
  try {
    const url = "https://www.fotmob.com/api/allMatches?date=today";
    const r = await axios.get(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 8000
    });

    const leagues = r.data.leagues ?? [];
    const list = [];

    leagues.forEach(lg => {
      (lg.matches || []).forEach(m => {
        list.push({
          id: m.id || String(m.home?.name + "-" + m.away?.name),
          home: m.home?.name,
          away: m.away?.name,
          time: m.time,
          score: m.status?.scoreStr || null,
          league: lg.name,
          country: lg.ccode || null,
        });
      });
    });

    return list;
  } catch (err) {
    console.log("⚠️ FotMob error:", err.response?.status, err.message);
    return [];
  }
};
