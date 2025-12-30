/**
 * 365Scores – Fixtures scraper
 * Unofficial feed — JSON endpoint
 */

const axios = require("axios");

module.exports = async function scrape365Scores() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const r = await axios.get(
      `https://webws.365scores.com/web/games/?langId=1&country=ENG&sports=1&date=${today}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        },
        timeout: 10000
      }
    );

    const arr = r.data?.games || [];
    return arr.map(x => ({
      id: x.id,
      home: x.homeCompetitor?.name,
      away: x.awayCompetitor?.name,
      timestamp: x.startTime ? Number(x.startTime) : null,
      league: x.competitionDisplayName || "",
      country: x.country?.name || "",
      stage: x.stage || "",
      isLive: x.status?.type === "inprogress" ? true : false,
    }));

  } catch (e) {
    console.log("⚠️ 365Scores error", e.message);
    return [];
  }
};
