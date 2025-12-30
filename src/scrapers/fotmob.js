const axios = require("axios");

module.exports = async function(){
  try{
    const r = await axios.get(
      "https://www.fotmob.com/api/matches?timezone=UTC",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    return r?.data?.matches || [];
  } catch (e) {
    return [];
  }
}
