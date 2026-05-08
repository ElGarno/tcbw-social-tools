export function resolveTeamMode(team, variant, teamsData) {
  const t = teamsData[team];
  const isPokalTeam = !!t?.isPokal;
  const isPokalVariant = variant === "pokal";
  const isPokal = isPokalTeam || isPokalVariant;
  return {
    isPokal,
    league: t?.league ?? "",
    matches: isPokal ? null : (t?.matches ?? null),
  };
}

export function findMatchIndex(team, opponent, date, teamsData) {
  const t = teamsData[team];
  if (!t?.matches) return -1;
  return t.matches.findIndex(m => m.opponent === opponent && m.date === date);
}
