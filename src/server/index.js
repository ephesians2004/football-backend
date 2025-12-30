const express = require('express');
const cron = require('node-cron');
const routes = require('./routes');
const { safeScrape } = require('../cron/scrapeAll');
const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(express.json());

app.get('/health', (_req,res)=>res.json({status:"ok"}));
app.use("/", routes);

cron.schedule('*/30 * * * *', async ()=> safeScrape());
setTimeout(safeScrape, 5000);

app.listen(PORT, "0.0.0.0", ()=> console.log("🚀 running on "+PORT));
