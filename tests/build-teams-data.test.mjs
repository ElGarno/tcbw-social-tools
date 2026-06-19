import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTeamMd, parsePokalYaml, isoToGerman } from "../scripts/build-teams-data.mjs";

const SAMPLE_MD = `---
title: "Herren 30"
league: "Kreisliga"
captain: "Horlacher Marc"
---

Herren 30 6er Mannschaft in der Kreisliga (Gr. 067 SI), Saison Sommer 2026.

## Spielplan Sommer 2026

| Datum | Uhrzeit | Heim | Gast | Ergebnis |
|-------|---------|------|------|----------|
| 09.05.2026 | 13:00 | **TC BW Attendorn** | Olper TC | - |
| 13.06.2026 | 10:00 | TV Rosenthal 1899 2 | **TC BW Attendorn** | - |
`;

test("parseTeamMd extracts title and league from frontmatter", () => {
  const result = parseTeamMd(SAMPLE_MD);
  assert.equal(result.title, "Herren 30");
  assert.equal(result.league, "Kreisliga");
});

test("parseTeamMd extracts matches with date, time, opponent, home flag", () => {
  const result = parseTeamMd(SAMPLE_MD);
  assert.equal(result.matches.length, 2);
  assert.deepEqual(result.matches[0], {
    date: "09.05.2026", time: "13:00", opponent: "Olper TC", home: true, result: null,
  });
  assert.deepEqual(result.matches[1], {
    date: "13.06.2026", time: "10:00", opponent: "TV Rosenthal 1899 2", home: false, result: null,
  });
});

test("parseTeamMd reads the result column ('-' or empty => null, else the score)", () => {
  const md = `---
title: "Herren 30"
league: "Kreisliga"
---

| Datum | Uhrzeit | Heim | Gast | Ergebnis |
|-------|---------|------|------|----------|
| 09.05.2026 | 13:00 | **TC BW Attendorn** | Olper TC | 6:3 |
| 13.06.2026 | 10:00 | TV Rosenthal 1899 2 | **TC BW Attendorn** | - |
`;
  const r = parseTeamMd(md);
  assert.equal(r.matches[0].result, "6:3");
  assert.equal(r.matches[1].result, null);
});

test("parseTeamMd handles 'TC BW Attendorn 2' (reserve team) as home identifier", () => {
  const md = `---
title: "Gemischte 2"
league: "Kreisklasse"
---

| Datum | Uhrzeit | Heim | Gast | Ergebnis |
|-------|---------|------|------|----------|
| 18.07.2026 | 13:00 | TC Buschhütten | **TC BW Attendorn 2** | - |
| 08.08.2026 | 13:00 | **TC BW Attendorn 2** | TC 71 Netphen | - |
`;
  const result = parseTeamMd(md);
  assert.equal(result.matches[0].home, false);
  assert.equal(result.matches[0].opponent, "TC Buschhütten");
  assert.equal(result.matches[1].home, true);
  assert.equal(result.matches[1].opponent, "TC 71 Netphen");
});

test("isoToGerman converts ISO date to DD.MM.YYYY", () => {
  assert.equal(isoToGerman("2026-05-05"), "05.05.2026");
});

test("parsePokalYaml maps rounds to matches keyed by team label", () => {
  const yamlText = `teams:
  - slug: "herren-lk18-25"
    label: "Herren-Pokal LK 18–25"
    detail: "WTV Vereinspokal · Herren LK 18,0–25,0"
    liga_url: "http://x?group=2229674"
    rounds:
      - branch: haupt
        round: 1
        date: 2026-05-05
        time: "18:00"
        home: true
        opponent: "TV Rönkhausen 1892 TA"
        result: "2:1"
        outcome: win
      - branch: haupt
        round: 3
        date: 2026-06-09
        time: "18:00"
        home: false
        opponent: "TV Rosenthal 1899"
        result: "1:2"
        outcome: win
`;
  const teams = parsePokalYaml(yamlText);
  const t = teams["Herren-Pokal LK 18–25"];
  assert.ok(t, "team keyed by label");
  assert.equal(t.isPokal, true);
  assert.equal(t.league, "WTV Vereinspokal");
  assert.equal(t.matches.length, 2);
  assert.deepEqual(t.matches[0], {
    date: "05.05.2026", time: "18:00", opponent: "TV Rönkhausen 1892 TA", home: true, result: "2:1",
  });
  assert.equal(t.matches[1].home, false);
  assert.equal(t.matches[1].result, "1:2");
});

test("parsePokalYaml on empty/invalid input returns {}", () => {
  assert.deepEqual(parsePokalYaml(""), {});
  assert.deepEqual(parsePokalYaml("teams:\n"), {});
});
