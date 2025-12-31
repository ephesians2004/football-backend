const Redis = require("ioredis");
const client = new Redis(process.env.REDIS_URL);

async function get(key){ return await client.get(key); }
async function set(k,v,exp){ return exp ? client.set(k,v,"EX",exp) : client.set(k,v); }

module.exports = { client, get, set };
