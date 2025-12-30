const axios = require("axios");

module.exports = async function(){
  try {
    const r = await axios.get(
      "https://webws.365scores.com/web/games/?competition=0",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    return r?.data?.games || [];
  } catch (e) {
    return [];
  }
}
