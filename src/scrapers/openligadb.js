const axios = require("axios");

/**
 * OpenLigaDB — Live + Fixtures (Germany only)
 * Docs: https://www.openligadb.de/api/
 */

const BASE = "https://api.openligadb.de";

async function getLive() {
  try {
    const url = `${BASE}/getlivematch`;
    const { data } = await axios.get(url, { timeout: 8000 });

    return data.map(m => ({
      id: String(m.MatchID),
      league: m.LeagueName,
      home: m.Team1.TeamName,
      away: m.Team2.TeamName,
      score: `${m.Team1Score}:${m.Team2Score}`,
      status: m.MatchIsFinished ? "FINISHED" : m.MatchDateTimeUTC,
      minute: m.MatchMinute ?? null,
      date: m.MatchDateTimeUTC,
      source: "openligadb"
    }));
  } catch {
    return [];
  }
}

async function getFixtures() {
  try {
    const season = new Date().getFullYear();
    const url = `${BASE}/getmatchdata/bl1/${season}`;
    const { data } = await axios.get(url, { timeout: 8000 });

    return data.map(m => ({
      id: String(m.MatchID),
      league: m.LeagueName,
      home: m.Team1.TeamName,
      away: m.Team2.TeamName,
      date: m.MatchDateTimeUTC,
      status: m.MatchIsFinished ? "FINISHED" : "SCHEDULED",
      source: "openligadb"
    }));
  } catch {
    return [];
  }
}

module.exports = { getLive, getFixtures };
