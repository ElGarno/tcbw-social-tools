import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTeamMode } from "../src/lib/resolve-team-mode.js";

const TEAMS = {
  "Herren 30": {
    league: "Kreisliga",
    matches: [{ date: "09.05.2026", time: "13:00", opponent: "Olper TC", home: true }],
  },
  "Herren-Pokal": {
    league: "WTV Vereinspokal",
    matches: null,
    isPokal: true,
  },
};

test("league team in 'win' variant: not pokal, returns matches", () => {
  const m = resolveTeamMode("Herren 30", "win", TEAMS);
  assert.equal(m.isPokal, false);
  assert.equal(m.league, "Kreisliga");
  assert.equal(m.matches.length, 1);
});

test("league team in 'pokal' variant: isPokal true, matches null", () => {
  const m = resolveTeamMode("Herren 30", "pokal", TEAMS);
  assert.equal(m.isPokal, true);
  assert.equal(m.matches, null);
});

test("pokal team in any variant: isPokal true", () => {
  const m = resolveTeamMode("Herren-Pokal", "win", TEAMS);
  assert.equal(m.isPokal, true);
  assert.equal(m.matches, null);
});

test("unknown team: empty league, no matches, isPokal false", () => {
  const m = resolveTeamMode("Phantom", "win", TEAMS);
  assert.equal(m.isPokal, false);
  assert.equal(m.league, "");
  assert.equal(m.matches, null);
});
