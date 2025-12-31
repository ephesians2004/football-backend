const axios = require("axios");

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE = "https://v3.football.api-sports.io";

module.exports = async function apiFootballFixtures() {
  if (!API_KEY) throw new Error("Missing API_FOOTBALL_KEY env");

  try {
    const res = await axios.get(`${BASE}/fixtures?next=50`, {
      headers: { "x-apisports-key": API_KEY }
    });

    return res.data.response.map(f => ({
      home: f.teams.home.name,
      away: f.teams.away.name,
      timestamp: f.fixture.timestamp,
      league: f.league.name
    }));
  } catch (err) {
    console.log("⚠️ API-FOOTBALL error", err.message);
    return [];
  }
};
