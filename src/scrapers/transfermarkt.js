/**
 * Transfermarkt – Squads & Market Values
 * WARNING: Site has anti-scrape protections — keep usage low
 */

const axios = require("axios");
const cheerio = require("cheerio");

async function fetchSquads() {
  try {
    const r = await axios.get(
      "https://www.transfermarkt.com/uefa-champions-league/startseite/wettbewerb/CL",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "text/html"
        },
        timeout: 10000
      }
    );

    const $ = cheerio.load(r.data);
    const out = [];

    $("table.items > tbody > tr").each((_, tr) => {
      const team = $(tr).find(".hauptlink .vereinprofil_tooltip").text().trim();
      const value = $(tr).find("td.rechts.hauptlink").text().trim();

      if (team) out.push({ team, value });
    });

    return out;

  } catch (e) {
    console.log("⚠️ Transfermarkt squads error:", e.message);
    return [];
  }
}

async function fetchValuesOnly() {
  try {
    const r = await axios.get(
      "https://www.transfermarkt.com/market-values/uefa-champions-league/marktwerte/wettbewerb/CL",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html"
        },
        timeout: 8000
      }
    );

    const $ = cheerio.load(r.data);
    const out = [];

    $("table.items > tbody > tr").each((_, tr) => {
      const name = $(tr).find(".hauptlink > a").text().trim();
      const value = $(tr).find(".rechts.hauptlink").text().trim();
      if (name) out.push({ name, value });
    });

    return out;

  } catch (e) {
    console.log("⚠️ Transfermarkt values error:", e.message);
    return [];
  }
}

module.exports = async function(){
  return await fetchSquads();
};

module.exports.getValues = async function(){
  return await fetchValuesOnly();
};
