const { get } = require("../utils/http");

async function getLive() {
  const data = await get("https://www.scorebat.com/video-api/v3/");
  if (!data?.response) return [];

  return data.response.map(v => ({
    id: null,
    title: v.title,
    home: v.title,
    away: "",
    league: v.competition,
    date: v.date,
    thumbnail: v.thumbnail,
    source: "scorebat"
  }));
}

module.exports = { getLive };
