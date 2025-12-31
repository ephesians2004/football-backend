const axios = require("axios");

module.exports = async function sportsdb() {
  try {
    const url = "https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328"; // EPL
    const r = await axios.get(url, { timeout: 8000 });

    const list = [];
    (r.data?.events || []).forEach(ev => {
      list.push({
        id: ev.idEvent,
        home: ev.strHomeTeam,
        away: ev.strAwayTeam,
        date: ev.dateEvent,
        time: ev.strTime,
        league: ev.strLeague,
        status: "Not Started"
      });
    });

    return list;
  } catch (err) {
    console.log("⚠️ TheSportsDB error:", err.message);
    return [];
  }
};
