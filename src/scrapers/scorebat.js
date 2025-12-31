const axios = require("axios");

/**
 * ScoreBat — Simple JSON feed
 * Live matches not always present, but great fallback
 */
const URL = "https://www.scorebat.com/video-api/v3/";

async function getLive() {
  try {
    const { data } = await axios.get(URL, { timeout: 6000 });

    return (data.response || []).map(x => ({
      id: x.id || null,
      title: x.title,
      home: x.title?.split(" vs ")[0] || "",
      away: x.title?.split(" vs ")[1] || "",
      league: x.competition,
      date: x.date,
      thumbnail: x.thumbnail,
      source: "scorebat"
    }));
  } catch {
    return [];
  }
}

module.exports = { getLive };
