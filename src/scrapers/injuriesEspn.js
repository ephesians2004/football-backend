const axios = require("axios");

module.exports = async function injuriesEspn() {
  try {
    const url = "https://site.web.api.espn.com/apis/site/v2/sports/soccer/eng.1/injuries"; // EPL feed
    const r = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 8000,
    });

    const list = [];
    const items = r.data?.injuries ?? [];

    items.forEach(team => {
      (team.injuries || []).forEach(p => {
        list.push({
          id: p.athlete?.id,
          name: p.athlete?.displayName,
          team: team.team?.displayName,
          status: p.status,
          position: p.athlete?.position?.abbreviation,
          detail: p.details,
          return: p.expectedReturn,
        });
      });
    });

    return list;
  } catch (err) {
    console.log("⚠️ ESPN injury scrape error:", err.response?.status, err.message);
    return [];
  }
};
