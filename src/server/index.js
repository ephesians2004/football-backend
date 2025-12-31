require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./routes");
const { scrapeAll } = require("./scraperInit");

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use("/", router);

setInterval(scrapeAll, 60 * 1000);   // auto refresh each minute
scrapeAll();                         // first run

app.listen(PORT, ()=> console.log(`🚀 Server live on ${PORT}`));
