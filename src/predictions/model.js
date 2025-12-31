function calcProbability(f) {
  // Base weights
  let form = 0.18, goals = 0.15, rank = 0.15, home = 0.20, odds = 0.20, streak = 0.12;

  // Random micro-variance (AI-like variation)
  const rnd = () => Math.random() * 0.05;

  // Placeholder — real formula will use external stats later
  let homeScore = home + form + rnd();
  let awayScore = rank + goals + rnd();

  const total = homeScore + awayScore;
  const pHome = homeScore / total;
  const pAway = awayScore / total;

  return {
    home: pHome,
    draw: 0,
    away: pAway,
    pick: pHome > pAway ? "HOME" : "AWAY",
    confidence: (Math.max(pHome, pAway) * 100).toFixed(1) + "%"
  };
}

module.exports = function predict(fixtures) {
  return fixtures.map(m => ({
    match: `${m.home} vs ${m.away}`,
    id: m.id,
    league: m.league,
    ...calcProbability(m)
  }));
};
