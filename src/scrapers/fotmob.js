const axios = require("axios");

module.exports = async function(){
  try {
    const r = await axios.get(
      "https://www.fotmob.com/api/matches?timezone=UTC",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }
    );

    return r?.data?.matches || [];
  } catch (e) {
    console.log("⚠️ FotMob error", e.message);
    return [];
  }
};
