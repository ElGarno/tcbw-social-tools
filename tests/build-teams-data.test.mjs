import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTeamMd } from "../scripts/build-teams-data.mjs";

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
    date: "09.05.2026",
    time: "13:00",
    opponent: "Olper TC",
    home: true,
  });
  assert.deepEqual(result.matches[1], {
    date: "13.06.2026",
    time: "10:00",
    opponent: "TV Rosenthal 1899 2",
    home: false,
  });
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
