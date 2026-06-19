import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTeamMode } from "../src/lib/resolve-team-mode.js";

const TEAMS = {
  "Herren 30": {
    league: "Kreisliga",
    matches: [{ date: "09.05.2026", time: "13:00", opponent: "Olper TC", home: true, result: null }],
  },
  "Herren-Pokal LK 18–25": {
    league: "WTV Vereinspokal",
    isPokal: true,
    matches: [{ date: "05.05.2026", time: "18:00", opponent: "TV Rönkhausen 1892 TA", home: true, result: "2:1" }],
  },
  "Pokal-ohne-Runden": { league: "WTV Vereinspokal", isPokal: true, matches: null },
};

test("league team in 'win' variant: not pokal, returns matches", () => {
  const m = resolveTeamMode("Herren 30", "win", TEAMS);
  assert.equal(m.isPokal, false);
  assert.equal(m.league, "Kreisliga");
  assert.equal(m.matches.length, 1);
});

test("league team in 'pokal' variant: isPokal true, but matches still returned (variant is styling only)", () => {
  const m = resolveTeamMode("Herren 30", "pokal", TEAMS);
  assert.equal(m.isPokal, true);
  assert.equal(m.matches.length, 1);
});

test("pokal team with rounds: isPokal true, returns its matches", () => {
  const m = resolveTeamMode("Herren-Pokal LK 18–25", "win", TEAMS);
  assert.equal(m.isPokal, true);
  assert.equal(m.matches.length, 1);
});

test("pokal team without rounds: isPokal true, matches null (free-text fallback)", () => {
  const m = resolveTeamMode("Pokal-ohne-Runden", "win", TEAMS);
  assert.equal(m.isPokal, true);
  assert.equal(m.matches, null);
});

test("unknown team: empty league, no matches, isPokal false", () => {
  const m = resolveTeamMode("Phantom", "win", TEAMS);
  assert.equal(m.isPokal, false);
  assert.equal(m.league, "");
  assert.equal(m.matches, null);
});
