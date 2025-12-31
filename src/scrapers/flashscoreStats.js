const axios = require("axios");

module.exports = async function flashStats() {
  try {
    const url = "https://www.flashscore.com.ua/flashscore-data/match-details.json";

    const r = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const list = r.data?.stats ?? [];
    return list.map(s => ({
      id: s.id,
      ballPoss: s.possession,
      shots: s.shots,
      onTarget: s.shotsOnTarget,
      corners: s.corners,
      fouls: s.fouls,
      cards: s.cards
    }));

  } catch (err) {
    console.log("⚠️ FlashScore Stats error:", err.response?.status, err.message);
    return [];
  }
};
