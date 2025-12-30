const express = require("express");
const cron = require("node-cron");
const api = require("./routes");
const { scrapeCategory, preloadStartup } = require("../cron/scrapeAll");

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", ts: Date.now() }));

// API endpoints
app.use("/", api);

// Run staggered scraping — ALL categories spaced to avoid CPU overload
cron.schedule("*/30 * * * *", async () => {
  console.log("⏳ Cron triggered — staggered scrape begins");
  await scrapeCategory("fixtures");
  await scrapeCategory("live");
  await scrapeCategory("injuries");
  await scrapeCategory("predictions");
  await scrapeCategory("squads");
  await scrapeCategory("values");
});

// On startup → load historical cache so data is available immediately
setTimeout(() => preloadStartup(), 3000);

app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Backend running on :${PORT}`));
