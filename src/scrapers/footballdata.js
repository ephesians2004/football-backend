// src/scrapers/footballdata.js
const axios = require("axios");

const API_KEY = process.env.FOOTBALLDATA_KEY;
const BASE = "https://api.football-data.org/v4";

async function getFixtures() {
  try {
    const leagues = [
      "PL", "PD", "SA", "BL1", "FL1", "PPL", "DED", "CL" // England, Spain, Italy, Germany, France, Portugal, Netherlands, UCL
    ];

    let results = [];

    for (const league of leagues) {
      const res = await axios.get(`${BASE}/competitions/${league}/matches`, {
        headers: { "X-Auth-Token": API_KEY }
      });

      const arr = res.data.matches || [];

      arr.forEach(m => {
        results.push({
          id: m.id,
          home: m.homeTeam?.name,
          away: m.awayTeam?.name,
          date: m.utcDate,
          status: m.status,
          league,
          source: "football-data"
        });
      });
    }

    return results;
  } catch (err) {
    console.log("⚠ football-data error:", err.response?.status || err.message);
    return [];
  }
}

module.exports = { getFixtures };
