/**
 * Basic probability generator — no external API
 * Works even offline — never fails
 */

module.exports = async function generatePredictions() {
  try {
    // placeholder — normally this would read from fixtures
    return [
      {
        fixtureId: "sim-1",
        home: "HomeTeam",
        away: "AwayTeam",
        winHomeProb: 0.48,
        winAwayProb: 0.27,
        drawProb: 0.25,
        recommendedBet: "Home Win (48%)"
      }
    ];
  } catch (err) {
    console.log("⚠️ FootyStats Prediction Error:", err.message);
    return [];
  }
};
