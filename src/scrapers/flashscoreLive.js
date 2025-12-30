/**
 * FlashScore – LIVE MATCHES
 * Returns: id, home, away, score, minute, status
 *
 * Source feed: hidden undocumented FlashScore feed
 */

const axios = require("axios");

module.exports = async function scrapeFlashscoreLive() {
  try {
    const r = await axios.get(
      "https://d.flashscore.com/x/feed/f_1_0_3_en_1",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
          "Referer": "https://www.flashscore.com/",
          "Accept": "*/*",
        },
        timeout: 8000
      }
    );

    if (!r.data) return [];

    const rows = r.data.split("\n");
    const matches = [];

    rows.forEach(row => {
      if (!row.startsWith("EV")) return;
      const c = row.split("|");

      matches.push({
        id: c[1],
        league: c[2],
        home: c[3],
        away: c[4],
        score: c[5],
        minute: c[6],
        status: c[7]
      });
    });

    return matches;

  } catch (e) {
    console.log("⚠️ FlashScore LIVE error:", e.message);
    return [];
  }
};
