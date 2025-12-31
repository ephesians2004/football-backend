const { get } = require("../utils/http");

const KEY = process.env.FOOTBALLDATA_KEY;

async function fetchToday() {
  const today = new Date().toISOString().split("T")[0];

  const leagues = ["PL","PD","SA","BL1","FL1","DED","BSA","PPL"]; // global
  let all = [];

  for (let code of leagues) {
    const url = `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${today}&dateTo=${today}`;
    const data = await get(url, { "X-Auth-Token": KEY });

    if (!data?.matches) continue;

    const mapped = data.matches.map(m => ({
      id: m.id,
      home: m.homeTeam?.name,
      away: m.awayTeam?.name,
      date: m.utcDate,
      league: m.competition?.name,
      status: m.status
    }));

    all.push(...mapped);
  }

  return all;
}

module.exports = fetchToday;
