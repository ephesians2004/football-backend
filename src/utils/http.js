const axios = require("axios");

async function get(url, headers = {}, timeout = 8000) {
  try {
    const res = await axios.get(url, { headers, timeout });
    return res.data;
  } catch (e) {
    console.log("⚠️ HTTP ERROR:", url, e?.response?.status || e.message);
    return null;
  }
}

module.exports = { get };
