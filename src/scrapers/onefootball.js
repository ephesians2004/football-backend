const axios = require("axios");

module.exports = async function(){
  try {
    const r = await axios.get(
      "https://api.onefootball.com/scores-microservice/fixtures?timezone=UTC",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
          "Accept": "application/json"
        },
        timeout: 7000
      }
    );

    const list = r?.data?.data?.fixtures || [];
    return list.map(f => ({
      id: f?.id,
      league: f?.competition?.name,
      leagueId: f?.competition?.id,
      home: f?.teams?.home?.name,
      away: f?.teams?.away?.name,
      start: f?.kickoff?.label,
      timestamp: f?.kickoff?.timestamp
    }));

  } catch (e) {
    console.log("⚠️ OneFootball blocked:", e.message);
    return [];
  }
};
