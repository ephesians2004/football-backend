const axios = require("axios");

module.exports = async function scores365() {
  try {
    const r = await axios.get(
      "https://webws.365scores.com/web/games/current/?langId=1&timezoneName=Africa/Accra",
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 }
    );

    const list = [];
    const games = r.data?.games ?? [];

    games.forEach(g => {
      if (g.sportId !== 1) return; // 1 = soccer
      list.push({
        id: g.id,
        home: g.homeName,
        away: g.awayName,
        score: `${g.homeScore ?? 0}-${g.awayScore ?? 0}`,
        minute: g.gameTime,
        league: g.competitionDisplayName,
        country: g.countryName
      });
    });

    return list;
  } catch (err) {
    console.log("⚠️ 365Scores error:", err.message);
    return [];
  }
};
