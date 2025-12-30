const axios = require("axios");
const cheerio = require("cheerio");

// scrape club squads (TOP 20 only — to protect server)
module.exports = async function(){
  try {
    const html = await axios.get(
      "https://www.transfermarkt.com/spieler-statistik/marktwertanalyse/statistik",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0)",
          "Accept": "text/html"
        },
        timeout: 12000
      }
    ).then(r => r.data);

    const $ = cheerio.load(html);
    const rows = [];

    $("table.items tbody tr").each((i, el) => {
      if (i >= 50) return;
      const cols = $(el).find("td");
      rows.push({
        name: $(cols[1]).text().trim(),
        club: $(cols[2]).text().trim(),
        value: $(cols[5]).text().trim(),
        age: $(cols[3]).text().trim()
      });
    });

    return rows;

  } catch (e) {
    console.log("⚠️ Transfermarkt squad error:", e.message);
    return [];
  }
};

// ---- second export: aggregated club value ----
module.exports.getValues = async function(){
  try {
    const html = await axios.get(
      "https://www.transfermarkt.com/wettbewerbe/europa",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0)",
          "Accept": "text/html"
        },
        timeout: 12000
      }
    ).then(r => r.data);

    const $ = cheerio.load(html);
    const result = [];

    $("table.items tbody tr").each((i, el) => {
      if (i >= 50) return;
      const cols = $(el).find("td");
      result.push({
        league: $(cols[1]).text().trim(),
        avgValue: $(cols[4]).text().trim(),
        totalValue: $(cols[3]).text().trim()
      });
    });

    return result;

  } catch (e) {
    console.log("⚠️ Transfermarkt VALUE error:", e.message);
    return [];
  }
};
