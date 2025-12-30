const axios = require("axios");

module.exports = async function(){
  try {
    const r = await axios.get(
      "https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328"
    );
    return r?.data?.events || [];
  } catch (e) {
    return [];
  }
};
