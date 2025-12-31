// src/scrapers/footballdataProxy.js
const axios = require("axios");

const BASE = "https://footballproxy.ephesians2004.workers.dev";
const KEY = process.env.FOOTBALLDATA_KEY;  // MUST be set in Railway

/**
 * Fetch today's fixtures via proxy
 */
async function getFixtures() {
  try {
    const url = `${BASE}?url=https://api.football-data.org/v4/matches&X-Auth-Token=${KEY}`;
    const res = await axios.get(url, { timeout: 8000 });

    if (!res.data || !res.data.matches) return [];

    return res.data.matches
      .filter(m => m.status !== "FINISHED")
      .map(m => ({
        id: m.id,
        home: m.homeTeam?.name,
        away: m.awayTeam?.name,
        date: m.utcDate,
        league: m.competition?.name,
        status: m.status
      }));

  } catch (err) {
    console.log("⚠️ FootballDataProxy error", err?.response?.status);
    return [];
  }
}

module.exports = { getFixtures };
