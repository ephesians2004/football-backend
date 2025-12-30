const axios = require("axios");

module.exports = async function(){
  try {
    const r = await axios.get(
      "https://www.sofascore.com/api/v1/sport/football/events/live",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    return r?.data?.events || [];
  } catch (e) {
    return [];
  }
};
