const axios = require("axios");

module.exports = async function(){
  try {
    const r = await axios.get(
      "https://site.api.espn.com/apis/v2/sports/soccer/injuries",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    return r?.data?.injuries || [];
  } catch (e) {
    return [];
  }
};
