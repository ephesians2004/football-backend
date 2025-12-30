/**
 * FlashScore – Extended Match Stats
 * Adds: yellow cards, red cards, corners, possession
 */

const axios = require("axios");

module.exports = async function scrapeFlashscoreStats() {
  try {
    const r = await axios.get(
      "https://d.flashscore.com/x/feed_d_stat/?sport=football",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)",
          "Accept": "*/*"
        },
        timeout: 8000
      }
    );

    if (!r.data) return [];

    const stats = [];
    const lines = r.data.split("\n");

    lines.forEach(line => {
      if (!line.startsWith("STAT")) return;
      const c = line.split("|");

      stats.push({
        id: c[2],
        yellow: c[6] || null,
        red: c[7] || null,
        corners: c[8] || null,
        possession: c[9] || null
      });
    });

    return stats;

  } catch (e) {
    console.log("⚠️ FlashScore Stats error:", e.message);
    return [];
  }
};
