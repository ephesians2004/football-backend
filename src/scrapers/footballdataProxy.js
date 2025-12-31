// src/scrapers/footballdataProxy.js
const axios = require("axios");

const PROXY_BASE = "https://footballproxy.ephesians2004.workers.dev";

async function getFixtures() {
  try {
    const res = await axios.get(`${PROXY_BASE}/fixtures`);
    const arr = res.data || [];

    return arr.map(x => ({
      id: x.id,
      home: x.home,
      away: x.away,
      date: x.date,
      status: x.status,
      league: x.league,
      source: "proxy"
    }));
  } catch (e) {
    console.log("⚠ FD proxy error:", e.message);
    return [];
  }
}

module.exports = { getFixtures };
