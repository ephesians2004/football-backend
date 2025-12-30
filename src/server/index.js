/**
 * SERVER ENTRYPOINT
 * Boots Express + Cron + Cache lifecycle
 */

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const routes = require("./routes");
const cache = require("../utils/cache");
const { scrapeAll } = require("../cron/scrapeAll");

const app = express();
app.use(cors());
app.use(express.json());

// register API endpoints
app.use("/", routes);

// HEALTH CHECK
app.get("/health", (req, res) => res.json({ status: "ok" }));

// --------- START SERVER ----------
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on ${PORT}`);
});

// --------- CRON (every 30 min) ----------
cron.schedule("*/30 * * * *", async () => {
  try {
    await scrapeAll();
  } catch (e) {
    console.log("⚠️ CRON scrape error", e.message);
  }
});

// delay first scrape by 5 seconds (prevents Railway boot timeout)
setTimeout(() => {
  scrapeAll();
}, 5000);

// graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🔻 Shutdown");
  await cache.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🔻 Shutdown SIGINT");
  await cache.close();
  process.exit(0);
});
