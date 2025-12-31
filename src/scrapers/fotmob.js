const axios = require("axios");

module.exports = async function fotmob() {
  try {
    const url = "https://www.fotmob.com/api/matches?date=today";
    const r = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 10000
    });

    const groups = r.data.leagues || [];
    const fixtures = [];

    for (const league of groups) {
      for (const match of league.matches) {
        fixtures.push({
          id: match.id,
          home: match.home?.name,
          away: match.away?.name,
          time: match.time,
          status: match.status?.type,
          league: league.name
        });
      }
    }

    return fixtures;
  } catch (err) {
    console.log("⚠️ FotMob error:", err.message);
    return [];
  }
};
