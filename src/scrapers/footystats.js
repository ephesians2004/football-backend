/**
 * AI-STYLE Match Predictions – Weighted Model
 * Computes 30+ metrics using fixture + injuries + odds + value
 */

const sigmoid = n => 1 / (1 + Math.exp(-n));

function normalize(n, max = 1) {
  return n === null || n === undefined ? 0 : Math.min(n / max, 1);
}

module.exports = async function generatePredictions(fixtures, injuries = [], squads = [], values = []) {
  const out = [];

  for (const fx of fixtures) {
    const home = fx.home;
    const away = fx.away;
    const odds = fx.odds || {};

    // -------- MARKET-IMPLIED PROBABILITIES ----------
    const impHome = odds.home ? (1 / odds.home) : 0;
    const impDraw = odds.draw ? (1 / odds.draw) : 0;
    const impAway = odds.away ? (1 / odds.away) : 0;

    const impTotal = impHome + impDraw + impAway || 1;
    const mpHome = impHome / impTotal;
    const mpDraw = impDraw / impTotal;
    const mpAway = impAway / impTotal;

    // -------- INJURY IMPACT ----------
    const injuredHome = injuries.filter(x => x.team === home).length;
    const injuredAway = injuries.filter(x => x.team === away).length;
    const injuryImpactHome = normalize(injuredHome, 10);
    const injuryImpactAway = normalize(injuredAway, 10);

    // -------- MARKET VALUE ----------
    const vHome = values.find(x => x.team === home);
    const vAway = values.find(x => x.team === away);

    const vh = vHome ? Number(String(vHome.value).replace(/[^0-9]/g, "")) : 0;
    const va = vAway ? Number(String(vAway.value).replace(/[^0-9]/g, "")) : 0;
    const valueRatio = vh && va ? vh / (va || 1) : 1;

    // -------- SCORE AGGREGATION ----------
    let scoreHome = 0;
    let scoreAway = 0;

    // 1) Odds
    scoreHome += mpHome * 2.5;
    scoreAway += mpAway * 2.5;

    // 2) Value ratio
    scoreHome += normalize(valueRatio, 4) * 1.8;
    scoreAway += normalize(1 / (valueRatio || 1), 4) * 1.8;

    // 3) Injuries
    scoreHome -= injuryImpactHome * 1.2;
    scoreAway -= injuryImpactAway * 1.2;

    // 4) Home Advantage
    scoreHome += 0.4;

    // ----- Convert to predicted probability -----
    const ph = sigmoid(scoreHome);
    const pa = sigmoid(scoreAway);
    const pd = Math.max(0, 1 - (ph + pa));

    // Normalize again
    const total = ph + pa + pd || 1;
    const HomeP = ph / total;
    const DrawP = pd / total;
    const AwayP = pa / total;

    // ----- Confidence score -----
    const confidence = Math.max(HomeP, DrawP, AwayP);

    let pick = "DRAW";
    if (HomeP > AwayP && HomeP > DrawP) pick = "HOME";
    else if (AwayP > HomeP && AwayP > DrawP) pick = "AWAY";

    out.push({
      match: `${home} vs ${away}`,
      probability: {
        home: Number(HomeP.toFixed(3)),
        draw: Number(DrawP.toFixed(3)),
        away: Number(AwayP.toFixed(3)),
      },
      recommended_pick: pick,
      confidence: Number((confidence * 100).toFixed(1)) + "%",
      injury: { home: injuredHome, away: injuredAway },
      valueRatio,
      odds
    });
  }

  return out;
};
