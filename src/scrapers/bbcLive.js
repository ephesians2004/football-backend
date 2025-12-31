const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function bbcLive() {
  try {
    const html = await axios.get("https://www.bbc.com/sport/football/scores-fixtures", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(html.data);
    const live = [];

    $("li.gs-u-pb\\+").each((_, el) => {
      const home = $(el).find(".sp-c-fixture__team--home .sp-c-fixture__team-name").text().trim();
      const away = $(el).find(".sp-c-fixture__team--away .sp-c-fixture__team-name").text().trim();
      const score = $(el).find(".sp-c-fixture__score").text().trim();

      if (home && away) {
        live.push({ home, away, score });
      }
    });

    return live;
  } catch (err) {
    console.log("⚠️ BBC live error:", err.message);
    return [];
  }
};
