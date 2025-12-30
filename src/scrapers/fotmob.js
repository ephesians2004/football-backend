/**
 * FotMob – Fixtures scraper
 * Source: https://www.fotmob.com/
 * Method: Official public JSON feed
 */

const axios = require("axios");

module.exports = async function scrapeFotmob() {
  try {
    const r = await axios.get(
      "https://www.fotmob.com/api/matches?date=today",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        },
        timeout: 8000
      }
    );

    const leagues = r.data?.leagues || [];
    const out = [];

    leagues.forEach(l => {
      (l.matches || []).forEach(m => {
        out.push({
          id: m.id,
          home: m.home?.name || "",
          away: m.away?.name || "",
          timestamp: m.status?.startTime || null,
          league: l.name,
          country: l.ccode || "",
          imageHome: m.home?.imageUrl || null,
          imageAway: m.away?.imageUrl || null,
          status: m.status?.reason || "",
          isLive: m.status?.liveTime?.short ?? null
        });
      });
    });

    return out;

  } catch (e) {
    console.log("⚠️ FotMob error", e.message);
    return [];
  }
};
