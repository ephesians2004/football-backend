const axios = require("axios");

module.exports = async function(){
  try {
    const r = await axios.get(
      "https://d.flashscore.com/x/feed_d_stat/?sport=football",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)",
          "Referer": "https://www.flashscore.com/",
          "Accept": "*/*"
        },
        timeout: 8000
      }
    );

    if (!r.data) return [];

    const lines = r.data.split("\n").filter(l => l.startsWith("STAT"));

    return lines.map(row => {
      const c = row.split("|");
      return {
        id: c[2],
        yellow: c[6] ?? null,
        red: c[7] ?? null,
        corners: c[8] ?? null,
        possession: c[9] ?? null
      };
    });

  } catch (e) {
    console.log("⚠️ FlashScore stats error:", e.message);
    return [];
  }
};
