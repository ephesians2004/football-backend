/**
 * TheSportsDB – Fixtures
 * Free source – schedule based on leagues
 * Docs: https://www.thesportsdb.com/api.php
 */

const axios = require("axios");

// EXAMPLE league IDs — we fetch multiple for more fixtures
const LEAGUES = [
  "4328",  // English Premier League
  "4335",  // Spanish La Liga
  "4331",  // German Bundesliga
  "4332",  // Italian Serie A
  "4334",  // French Ligue 1
];

async function fetchLeague(id) {
  try {
    const r = await axios.get(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${new Date().toISOString().slice(0, 10)}&l=${id}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 10000
      }
    );
    const arr = r.data?.events || [];

    return arr.map(m => ({
      id: m.idEvent,
      home: m.strHomeTeam,
      away: m.strAwayTeam,
      timestamp: new Date(`${m.dateEvent}T${m.strTime}`).getTime(),
      league: m.strLeague,
      country: m.strCountry || "",
      imageHome: m.strHomeTeamBadge || null,
      imageAway: m.strAwayTeamBadge || null,
      round: m.intRound || null,
    }));

  } catch (e) {
    console.log("⚠️ TheSportsDB error", id, e.message);
    return [];
  }
}

module.exports = async function scrapeSportsDb() {
  try {
    const promises = LEAGUES.map(id => fetchLeague(id));
    const results = await Promise.allSettled(promises);

    const merged = [];
    results.forEach(r => {
      if (r.status === "fulfilled") merged.push(...r.value);
    });

    return merged;

  } catch (e) {
    console.log("⚠️ TheSportsDB global error", e.message);
    return [];
  }
};
