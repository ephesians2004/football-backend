const axios = require("axios");
const KEY = process.env.API_FOOTBALL_KEY;

module.exports = async function(){
  if (!KEY) return [];
  try {
    const r = await axios.get(
      "https://v3.football.api-sports.io/fixtures?timezone=UTC&next=50",
      {
        headers: {
          "x-apisports-key": KEY,
          "User-Agent": "Mozilla/5.0"
        }
      }
    );
    return r?.data?.response || [];
  } catch (e) {
    return [];
  }
};
