const { get } = require("../utils/http");
const KEY = process.env.FOOTBALLDATA_KEY;

async function fetchRange(days = 7) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const future = new Date();
  future.setDate(now.getDate() + days);
  const to = future.toISOString().split("T")[0];

  const leagues = ["PL","PD","SA","BL1","FL1","DED","BSA","PPL"]; // add more anytime
  let all = [];

  for (let code of leagues) {
    const url = `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${today}&dateTo=${to}`;

    const data = await get(url, { "X-Auth-Token": KEY });
    if (!data?.matches) continue;

    all.push(
      ...data.matches.map(m => ({
        id: m.id,
        home: m.homeTeam?.name,
        away: m.awayTeam?.name,
        date: m.utcDate,
        league: m.competition?.name,
        status: m.status
      }))
    );
  }
  return all;
}

module.exports = fetchRange;
