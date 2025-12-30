const axios = require('axios');

module.exports = async function(){
  try{
    const r = await axios.get("https://www.fotmob.com/api/matches");
    return r?.data?.matches || [];
  }catch(e){
    return [];
  }
}
