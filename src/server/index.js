require("dotenv").config();

const express = require("express");
const app = express();
const routes = require("./routes");
require("dotenv").config();
const cron = require("node-cron");
const { scrapeAll } = require("../cron/scrapeAll");

// trust proxy for Railway
app.set("trust proxy", 1);

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});

// CRON every 2 minutes
cron.schedule("*/2 * * * *", async () => {
  console.log("⏱ Cron scrape starting...");
  await scrapeAll();
});
