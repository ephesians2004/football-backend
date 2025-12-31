const axios = require("axios");
module.exports = async function injuries() {
  try {
    const url = "https://site.web.api.espn.com/apis/v2/sports/soccer/eng.1/news";
    const r = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" }});
    return r.data.articles?.map(a => ({
      title: a.headline,
      summary: a.description
    })) ?? [];
  } catch {
    return [];
  }
};
