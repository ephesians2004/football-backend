/**
 * ESPN Injuries – Scraper
 * Gets list of clubs + recent injury info
 * NOTE: ESPN occasionally blocks traffic → wrapped in try/catch
 */

const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function scrapeInjuries() {
  try {
    const r = await axios.get(
      "https://www.espn.com/soccer/injuries",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html"
        },
        timeout: 10000
      }
    );

    const $ = cheerio.load(r.data);
    const out = [];

    $(".ResponsiveTable").each((_, table) => {
      const league = $(table).prev("h2").text().trim();

      $(table)
        .find("tbody tr")
        .each((__, tr) => {
          const tds = $(tr).find("td");

          out.push({
            league,
            player: $(tds[0]).text().trim(),
            team: $(tds[1]).text().trim(),
            position: $(tds[2]).text().trim(),
            injury: $(tds[3]).text().trim(),
            status: $(tds[4]).text().trim()
          });
        });
    });

    return out;

  } catch (e) {
    console.log("⚠️ ESPN injury scrape error:", e.message);
    return [];
  }
};
