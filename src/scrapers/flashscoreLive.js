const axios = require("axios");

module.exports = async function flashscoreLive() {
  try {
    const r = await axios.get(
      "https://d.flashscore.com/x/feed/f_1_0_3_en_1",
      { headers: { "User-Agent": "Mozilla" }, timeout: 8000 }
    );
    const rows = (r.data || "").split("\n");
    const out = [];

    rows.forEach(line => {
      if (line.startsWith("EV;")) {
        const c = line.split(";");
        out.push({
          id: c[1],
          home: c[2],
          away: c[3],
          score: c[4]
        });
      }
    });

    return out;
  } catch (err) {
    console.log("⚠️ FlashScore LIVE error:", err.message);
    return [];
  }
};
