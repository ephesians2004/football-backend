const axios = require("axios");

module.exports = async function(){
  try {
    const r = await axios.get(
      "https://d.flashscore.com/x/feed_live/?sport=football",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
          "Referer": "https://www.flashscore.com/",
          "Accept": "*/*"
        },
        timeout: 8000
      }
    );

    if (!r.data) return [];

    // Raw FlashScore output = pipe | delimited
    // Example: "SOCCER|MATCH|1657837|Team A|Team B|..."
    const lines = r.data.split("\n").filter((l) => l.startsWith("SOCCER"));

    return lines.map((line) => {
      const data = line.split("|");
      return {
        id: data[2],
        home: data[3],
        away: data[4],
        status: data[5],
        homeScore: data[6] ?? null,
        awayScore: data[7] ?? null,
        minute: data[8] ?? null
      };
    });

  } catch (e) {
    console.log("⚠️ FlashScore blocked:", e.message);
    return [];
  }
};
