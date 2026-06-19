# Pokal-Daten + Auswärts-Ankündigungen + Ergebnis-Prefill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pokal-Spiele im Social-Generator per Dropdown wählbar machen (Heim/Auswärts, mit Ergebnis), Spielankündigungen auch für Auswärtsspiele (gleiche Farbe, Unterscheidung über Wording + „Auswärts"-Badge), und Ergebnis-Prefill — einheitlich für Medenspiel und Pokal.

**Architecture:** Build-Script liest zusätzlich `../tcbw-homepage/data/pokal.yaml` (Pokal-Pfade) und die Ergebnis-Spalte der Medenspiel-MDs → jedes Match in `teams.json` trägt jetzt `result`. `resolveTeamMode` liefert für Pokal echte Matches. Reine Ableitungs-Helfer (`announcementCopy`, `splitResult`) machen Wording und Score-Drehung testbar; Templates/Forms konsumieren sie.

**Tech Stack:** Vite + React, Node-`node:test` Runner (`node --test tests/*.test.mjs`), `gray-matter` + `js-yaml`.

**Spec:** `docs/superpowers/specs/2026-06-19-pokal-data-and-away-announcements-design.md`

---

## Critical context for the implementer

- Arbeitsverzeichnis: `~/PycharmProjects/tcbw-social-tools`. Das Repo `tcbw-homepage` liegt parallel (`../tcbw-homepage`).
- Tests: `node --test tests/*.test.mjs`. Stil: `import { test } from "node:test"; import assert from "node:assert/strict";`. Vorlagen: `tests/build-teams-data.test.mjs`, `tests/resolve-team-mode.test.mjs`.
- `src/data/teams.json` wird vom Build-Script generiert (`npm run prebuild` / `node scripts/build-teams-data.mjs`). NICHT von Hand editieren.
- Match-Datum im Tool ist deutsches Format `DD.MM.YYYY` (aus den MD-Tabellen). `data/pokal.yaml` nutzt ISO `YYYY-MM-DD` → muss konvertiert werden.
- `matchLabel(m)` (in `src/lib/format-date.js`) erzeugt `"DD.MM · Gegner (Heim|Auswärts)"` aus `m.date`/`m.opponent`/`m.home`.
- Ergebnis-String ist liga.nu-Konvention `home:guest` (z. B. `"6:3"` = Heim 6, Gast 3).
- `data/pokal.yaml`-Form (vom homepage-nuliga-sync gepflegt):
  ```yaml
  teams:
    - slug: "herren-lk18-25"
      label: "Herren-Pokal LK 18–25"
      detail: "WTV Vereinspokal · Herren LK 18,0–25,0"
      liga_url: "..."
      rounds:
        - { branch: haupt, round: 1, date: 2026-05-05, time: "18:00", home: true, opponent: "TV Rönkhausen 1892 TA", result: "2:1", outcome: win }
  ```

---

## Task 1: Build-Script — Ergebnis-Spalte der Medenspiel-MDs mitlesen

**Files:**
- Modify: `scripts/build-teams-data.mjs` (`parseTeamMd`)
- Test: `tests/build-teams-data.test.mjs`

- [ ] **Step 1: Vorhandene Tests anpassen + neuen Test ergänzen.** Die zwei bestehenden `deepEqual`-Assertions in `tests/build-teams-data.test.mjs` erwarten Matches OHNE `result` und brechen sonst. Ändere sie so, dass sie `result` enthalten, und füge einen Ergebnis-Test hinzu:

```js
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
```

Also update the `parseTeamMd extracts title...` and reserve-team tests if they `deepEqual` whole match objects — the reserve-team test asserts individual fields (`.home`, `.opponent`) so it stays valid; leave it.

- [ ] **Step 2: Run tests to verify the new/updated ones fail**

Run: `node --test tests/build-teams-data.test.mjs`
Expected: FAIL — matches lack `result`.

- [ ] **Step 3: Edit `parseTeamMd`** in `scripts/build-teams-data.mjs`. Replace the match-pushing block:

```js
    const [date, time, heim, gast] = cells;
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) continue;

    const heimIsUs = HOME_PATTERN.test(heim);
    const gastIsUs = HOME_PATTERN.test(gast);
    if (!heimIsUs && !gastIsUs) continue;

    const resultCell = cells[4];
    matches.push({
      date,
      time,
      opponent: heimIsUs ? gast.replace(/\*\*/g, "").trim() : heim.replace(/\*\*/g, "").trim(),
      home: heimIsUs,
      result: (!resultCell || resultCell === "-") ? null : resultCell,
    });
```

(Note: the existing `.filter(c => c.length > 0)` drops empty cells, so an empty result column yields `cells.length === 4` → `resultCell` undefined → `null`. A `-` stays as `cells[4]`.)

- [ ] **Step 4: Run tests to verify pass**

Run: `node --test tests/build-teams-data.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-teams-data.mjs tests/build-teams-data.test.mjs
git commit -m "feat(build): read result column from team schedules"
```

## Task 2: Build-Script — `data/pokal.yaml` einlesen

**Files:**
- Modify: `scripts/build-teams-data.mjs`
- Modify: `package.json` (devDependency `js-yaml`)
- Test: `tests/build-teams-data.test.mjs`

- [ ] **Step 1: js-yaml als devDependency hinzufügen**

Run: `npm install --save-dev js-yaml`
Expected: `js-yaml` erscheint in `package.json` devDependencies.

- [ ] **Step 2: Failing tests schreiben** — an `tests/build-teams-data.test.mjs` anhängen (Importe oben ergänzen: `parsePokalYaml, isoToGerman`):

```js
import { parseTeamMd, parsePokalYaml, isoToGerman } from "../scripts/build-teams-data.mjs";

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
```

- [ ] **Step 3: Run to verify fail**

Run: `node --test tests/build-teams-data.test.mjs`
Expected: FAIL — `parsePokalYaml`/`isoToGerman` not exported.

- [ ] **Step 4: Edit `scripts/build-teams-data.mjs`.** Add the `js-yaml` import at the top (after the `gray-matter` import):

```js
import yaml from "js-yaml";
```

Add these exports (near `parseTeamMd`):

```js
export function isoToGerman(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

export function parsePokalYaml(yamlText) {
  if (!yamlText || !yamlText.trim()) return {};
  const data = yaml.load(yamlText);
  const teamsArr = (data && data.teams) ? data.teams : [];
  const out = {};
  for (const t of teamsArr) {
    out[t.label] = {
      league: "WTV Vereinspokal",
      isPokal: true,
      matches: (t.rounds ?? []).map(r => ({
        date: isoToGerman(r.date),
        time: r.time,
        opponent: r.opponent,
        home: r.home,
        result: r.result ?? null,
      })),
    };
  }
  return out;
}
```

Replace the hardcoded `POKAL_TEAMS` const and its `Object.assign(teams, POKAL_TEAMS)` usage. New: a fallback const + reading the file inside `buildTeamsData`:

```js
const POKAL_DATA = path.join(HOMEPAGE_REPO, "data/pokal.yaml");

// Defensive fallback if data/pokal.yaml is missing (homepage repo not checked out):
// keep pokal teams selectable as free-text (matches: null).
const POKAL_FALLBACK = {
  "Herren-Pokal LK 18–25": { league: "WTV Vereinspokal", matches: null, isPokal: true },
  "Herren-40-Pokal":       { league: "WTV Vereinspokal", matches: null, isPokal: true },
};
```

In `buildTeamsData`, replace `Object.assign(teams, POKAL_TEAMS);` with:

```js
  let pokal;
  try {
    pokal = parsePokalYaml(fs.readFileSync(POKAL_DATA, "utf8"));
    if (Object.keys(pokal).length === 0) pokal = POKAL_FALLBACK;
  } catch {
    console.warn(`⚠ ${POKAL_DATA} not readable — pokal falls back to free-text`);
    pokal = POKAL_FALLBACK;
  }
  Object.assign(teams, pokal);
```

- [ ] **Step 5: Run tests + regenerate data**

Run: `node --test tests/build-teams-data.test.mjs`
Expected: PASS.
Run: `node scripts/build-teams-data.mjs`
Expected: `✓ Wrote .../teams.json`. Then verify pokal matches landed:
Run: `node -e "const t=require('./src/data/teams.json'); const p=t['Herren-Pokal LK 18–25']; console.log(p && p.matches && p.matches.length, p && p.matches && p.matches[0])"`
Expected: a match count ≥ 1 and a match object with `result`.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-teams-data.mjs tests/build-teams-data.test.mjs package.json package-lock.json src/data/teams.json
git commit -m "feat(build): source pokal matches from tcbw-homepage data/pokal.yaml"
```

## Task 3: `resolveTeamMode` — Pokal liefert echte Matches

**Files:**
- Modify: `src/lib/resolve-team-mode.js`
- Test: `tests/resolve-team-mode.test.mjs`

- [ ] **Step 1: Tests anpassen.** Mit echten Pokal-Matches darf `resolveTeamMode` für Pokal-Teams die Matches NICHT mehr auf `null` zwingen. Ersetze die betroffenen Tests in `tests/resolve-team-mode.test.mjs`:

```js
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
```

- [ ] **Step 2: Run to verify fail**

Run: `node --test tests/resolve-team-mode.test.mjs`
Expected: FAIL — current code returns `matches: null` whenever `isPokal`.

- [ ] **Step 3: Edit `src/lib/resolve-team-mode.js`** — change only the `matches` line in `resolveTeamMode`:

```js
export function resolveTeamMode(team, variant, teamsData) {
  const t = teamsData[team];
  const isPokalTeam = !!t?.isPokal;
  const isPokalVariant = variant === "pokal";
  const isPokal = isPokalTeam || isPokalVariant;
  return {
    isPokal,
    league: t?.league ?? "",
    matches: t?.matches ?? null,
  };
}
```

(`findMatchIndex` stays unchanged.)

- [ ] **Step 4: Run tests**

Run: `node --test tests/resolve-team-mode.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/resolve-team-mode.js tests/resolve-team-mode.test.mjs
git commit -m "feat(lib): resolveTeamMode returns matches for pokal teams"
```

## Task 4: Ableitungs-Helfer `announcementCopy` + `splitResult`

**Files:**
- Create: `src/lib/match-derive.js`
- Test: `tests/match-derive.test.mjs`

- [ ] **Step 1: Failing test `tests/match-derive.test.mjs`:**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { announcementCopy, splitResult } from "../src/lib/match-derive.js";

test("announcementCopy: home league", () => {
  assert.deepEqual(announcementCopy(true, "league"), {
    eyebrow: "Nächstes Heimspiel", connector: "vs.", cta: "Komm vorbei", badge: null,
  });
});

test("announcementCopy: away league has badge + away wording", () => {
  assert.deepEqual(announcementCopy(false, "league"), {
    eyebrow: "Auswärtsspiel", connector: "bei", cta: "Daumen drücken", badge: "Auswärts",
  });
});

test("announcementCopy: pokal home + away", () => {
  assert.equal(announcementCopy(true, "pokal").eyebrow, "Pokal-Heimspiel");
  assert.equal(announcementCopy(false, "pokal").eyebrow, "Pokal-Auswärtsspiel");
  assert.equal(announcementCopy(false, "pokal").badge, "Auswärts");
});

test("splitResult: home perspective keeps order", () => {
  assert.deepEqual(splitResult("6:3", true), { us: "6", them: "3" });
});

test("splitResult: away perspective flips", () => {
  assert.deepEqual(splitResult("1:2", false), { us: "2", them: "1" });
});

test("splitResult: unparseable returns null", () => {
  assert.equal(splitResult("", true), null);
  assert.equal(splitResult(null, true), null);
  assert.equal(splitResult("abc", true), null);
});
```

- [ ] **Step 2: Run to verify fail**

Run: `node --test tests/match-derive.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/lib/match-derive.js`:**

```js
/** Wording for a match announcement, derived from home/away + variant. Color is unchanged. */
export function announcementCopy(isHome, variant) {
  const pokal = variant === "pokal";
  if (isHome) {
    return {
      eyebrow: pokal ? "Pokal-Heimspiel" : "Nächstes Heimspiel",
      connector: "vs.",
      cta: "Komm vorbei",
      badge: null,
    };
  }
  return {
    eyebrow: pokal ? "Pokal-Auswärtsspiel" : "Auswärtsspiel",
    connector: "bei",
    cta: "Daumen drücken",
    badge: "Auswärts",
  };
}

/** Split a liga.nu "home:guest" result into our/their score from our perspective. */
export function splitResult(result, isHome) {
  if (!result) return null;
  const m = String(result).match(/(\d+):(\d+)/);
  if (!m) return null;
  const [, home, guest] = m;
  return isHome ? { us: home, them: guest } : { us: guest, them: home };
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/match-derive.test.mjs`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/match-derive.js tests/match-derive.test.mjs
git commit -m "feat(lib): add announcementCopy + splitResult derivation helpers"
```

## Task 5: Announcement-Template — Heim/Auswärts-Wording + Badge

**Files:**
- Modify: `src/templates/MatchAnnouncement.jsx`
- Modify: `src/catalog.js`

- [ ] **Step 1: `src/catalog.js`** — Label/Sublabel anpassen und `isHome` default ergänzen im `match-announcement`-Block:

```js
  "match-announcement": {
    label: "Spielankündigung",
    sublabel: "Ankündigung vor dem Match (Heim & Auswärts)",
    formats: ["square", "portrait", "story"],
    variants: [
      { id: "league", label: "Liga",  accent: "blue" },
      { id: "pokal",  label: "Pokal", accent: "orange" },
    ],
    Component: MatchAnnouncement,
    defaults: {
      team: "Herren 40",
      opponent: "Tennisclub Iserlohn",
      isHome: true,
      dateLine1: "30. Mai",
      dateLine2: "13:00 Uhr",
      league: "Südwestfalenliga",
      location: "Tennisanlage Burg Schnellenberg",
      cta: "Komm vorbei",
      eyebrow: "Nächstes Heimspiel",
    },
  },
```

- [ ] **Step 2: `src/templates/MatchAnnouncement.jsx`** — import the helper at the top:

```js
import { announcementCopy } from "../lib/match-derive.js";
```

- [ ] **Step 3:** In the component, compute copy and make the default `d` honour `isHome`. Replace the `const d = {...}` block with:

```js
  const isHome = data?.isHome ?? true;
  const copy = announcementCopy(isHome, variant);
  const d = {
    team: "Herren 40",
    opponent: "TC Iserlohn",
    dateLine1: "30. Mai",
    dateLine2: "13:00 Uhr",
    league: "Südwestfalenliga",
    location: isHome ? "Tennisanlage Burg Schnellenberg" : "Auswärts",
    cta: copy.cta,
    eyebrow: copy.eyebrow,
    ...data,
  };
```

- [ ] **Step 4:** Replace the hardcoded `vs.` connector in the "vs. opponent" block with the derived connector:

```js
          <span style={{ fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.6)", marginRight: 18 }}>
            {copy.connector}
          </span>
          {d.opponent}
```

- [ ] **Step 5:** Add an "Auswärts" badge in the TOP ROW. Replace the `<Eyebrow ...>` element (inside the top-row flex) so the eyebrow + optional badge stack on the left:

```js
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {copy.badge && (
            <span style={{
              alignSelf: "flex-start",
              fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: 18,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "#fff", background: "#dc2626",
              padding: "4px 14px", borderRadius: 8,
            }}>
              {copy.badge}
            </span>
          )}
          <Eyebrow scale={1.6} color={variant === "pokal" ? "#fb923c" : "var(--blue-200)"}>
            {d.eyebrow}
          </Eyebrow>
        </div>
```

(The `<Wappen ... />` sibling in that flex row stays unchanged.)

- [ ] **Step 6: Verify build compiles + visual smoke test**

Run: `npm run dev` (starts build-teams-data then Vite). Open the app, select template "Spielankündigung":
- A home match: eyebrow "Nächstes Heimspiel", "vs. Gegner", CTA "Komm vorbei", no badge.
- Toggle an away match (after Task 6): eyebrow "Auswärtsspiel", "bei Gegner", CTA "Daumen drücken", red "Auswärts" badge, same blue color.
Stop with Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add src/templates/MatchAnnouncement.jsx src/catalog.js
git commit -m "feat(announcement): home/away wording + Auswärts badge (same color)"
```

## Task 6: Announcement-Form — ungespielte Heim+Auswärts-Spiele

**Files:**
- Modify: `src/components/forms/MatchAnnouncementForm.jsx`

- [ ] **Step 1: Replace `src/components/forms/MatchAnnouncementForm.jsx`** entirely:

```jsx
import React from "react";
import { Field, Input, Hint, TeamSelect, TEAMS_DATA } from "../ui.jsx";
import { resolveTeamMode } from "../../lib/resolve-team-mode.js";
import { formatDateLong, matchLabel } from "../../lib/format-date.js";
import { announcementCopy } from "../../lib/match-derive.js";

export const MatchAnnouncementForm = ({ data, set, variant }) => {
  const mode = resolveTeamMode(data.team, variant, TEAMS_DATA);
  // Announcements are for matches not yet played.
  const upcoming = mode.matches?.filter(m => !m.result) ?? null;
  const hasUpcoming = upcoming && upcoming.length > 0;
  const selectedIdx = hasUpcoming
    ? upcoming.findIndex(m => m.opponent === data.opponent && formatDateLong(m.date) === data.dateLine1)
    : -1;

  const applyMatch = (m) => {
    const copy = announcementCopy(m.home, variant);
    set({
      opponent: m.opponent,
      dateLine1: formatDateLong(m.date),
      dateLine2: m.time + " Uhr",
      isHome: m.home,
      eyebrow: copy.eyebrow,
      cta: copy.cta,
      location: m.home ? "Tennisanlage Burg Schnellenberg" : "Auswärts",
    });
  };

  return (
    <>
      <div className="form-section-title">Mannschaft & Spiel</div>
      <Field label="Mannschaft">
        <TeamSelect value={data.team} onChange={v => {
          const t = TEAMS_DATA[v];
          const up = t.matches?.filter(m => !m.result) ?? null;
          if (up && up.length > 0) {
            set({ team: v, league: t.league });
            applyMatch(up[0]);
          } else {
            set({ team: v, league: t.league, opponent: "", dateLine1: "", dateLine2: "" });
          }
        }} />
        <Hint>Liga: <strong>{mode.league}</strong></Hint>
      </Field>

      {hasUpcoming ? (
        <>
          <Field label="Spiel">
            <select className="select" value={selectedIdx} onChange={e => {
              applyMatch(upcoming[parseInt(e.target.value, 10)]);
            }}>
              {upcoming.map((m, i) => (
                <option key={i} value={i}>{matchLabel(m)}</option>
              ))}
            </select>
            <Hint>Kommende Spiele aus liga.nu (Heim & Auswärts) — Auswahl setzt Wording automatisch.</Hint>
          </Field>
          <Field label="Uhrzeit">
            <Input value={data.dateLine2} onChange={v => set({ dateLine2: v })} placeholder="13:00 Uhr" />
            <Hint>Vorausgefüllt aus dem Spielplan — bei verschobener Anstoßzeit manuell anpassen.</Hint>
          </Field>
        </>
      ) : (
        <>
          <Field label="Gegner">
            <Input value={data.opponent} onChange={v => set({ opponent: v })} placeholder="Gegner manuell eintragen" />
            <Hint>Keine kommenden Spiele im Spielplan — bitte manuell eintragen.</Hint>
          </Field>
          <div className="field-row">
            <Field label="Datum"><Input value={data.dateLine1} onChange={v => set({ dateLine1: v })} placeholder="30. Mai" /></Field>
            <Field label="Uhrzeit"><Input value={data.dateLine2} onChange={v => set({ dateLine2: v })} placeholder="13:00 Uhr" /></Field>
          </div>
          <Field label="Heim / Auswärts">
            <select className="select" value={data.isHome ? "home" : "away"} onChange={e => {
              const isHome = e.target.value === "home";
              const copy = announcementCopy(isHome, variant);
              set({ isHome, eyebrow: copy.eyebrow, cta: copy.cta, location: isHome ? "Tennisanlage Burg Schnellenberg" : "Auswärts" });
            }}>
              <option value="home">Heimspiel</option>
              <option value="away">Auswärts</option>
            </select>
          </Field>
        </>
      )}

      <div className="form-section-title">Beschriftung</div>
      <Field label="Eyebrow (oben)"><Input value={data.eyebrow} onChange={v => set({ eyebrow: v })} placeholder="z.B. Nächstes Heimspiel" /></Field>
      <Field label="CTA (unten)"><Input value={data.cta} onChange={v => set({ cta: v })} placeholder="z.B. Komm vorbei" /></Field>
      <Field label="Ort"><Input value={data.location} onChange={v => set({ location: v })} /></Field>
    </>
  );
};
```

- [ ] **Step 2: Build + visual check**

Run: `npm run dev`. Template "Spielankündigung": choose a team, the "Spiel"-dropdown lists upcoming home AND away games; selecting an away game flips eyebrow/connector/CTA + shows the badge (template from Task 5). Pokal team: dropdown lists upcoming pokal rounds. Stop with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/MatchAnnouncementForm.jsx
git commit -m "feat(announcement): dropdown of upcoming home+away matches"
```

## Task 7: Ergebnis-Form — nur gespielte Spiele + Score-Prefill

**Files:**
- Modify: `src/components/forms/MatchResultForm.jsx`

- [ ] **Step 1: Replace `src/components/forms/MatchResultForm.jsx`** entirely:

```jsx
import React from "react";
import { Field, Input, NumberInput, Hint, TeamSelect, TEAMS_DATA } from "../ui.jsx";
import { resolveTeamMode, findMatchIndex } from "../../lib/resolve-team-mode.js";
import { matchLabel } from "../../lib/format-date.js";
import { splitResult } from "../../lib/match-derive.js";

export const MatchResultForm = ({ data, set, variant }) => {
  const mode = resolveTeamMode(data.team, variant, TEAMS_DATA);
  // Results are for matches already played.
  const played = mode.matches?.filter(m => m.result) ?? null;
  const hasPlayed = played && played.length > 0;
  const selectedIdx = hasPlayed
    ? played.findIndex(m => m.opponent === data.opponent && m.date === data.date)
    : -1;

  const applyMatch = (m) => {
    const score = splitResult(m.result, m.home);
    set({
      opponent: m.opponent,
      date: m.date,
      location: m.home ? "Heimspiel" : "Auswärts",
      ...(score ? { home: score.us, away: score.them } : {}),
    });
  };

  return (
    <>
      <div className="form-section-title">Mannschaft & Spiel</div>
      <Field label="Mannschaft">
        <TeamSelect value={data.team} onChange={v => {
          const t = TEAMS_DATA[v];
          const pl = t.matches?.filter(m => m.result) ?? null;
          if (pl && pl.length > 0) {
            set({ team: v, league: t.league });
            applyMatch(pl[0]);
          } else {
            set({ team: v, league: t.league, opponent: "", date: "", location: "Heimspiel" });
          }
        }} />
        <Hint>Liga: <strong>{mode.league}</strong></Hint>
      </Field>

      {hasPlayed ? (
        <Field label="Spiel">
          <select className="select" value={selectedIdx} onChange={e => {
            applyMatch(played[parseInt(e.target.value, 10)]);
          }}>
            {played.map((m, i) => (
              <option key={i} value={i}>{matchLabel(m)} — {m.result}</option>
            ))}
          </select>
          <Hint>Gespielte Spiele aus liga.nu — Gegner, Datum, Heim/Auswärts und Ergebnis werden vorausgefüllt.</Hint>
        </Field>
      ) : (
        <>
          <Field label="Gegner">
            <Input value={data.opponent} onChange={v => set({ opponent: v })} placeholder="Gegner manuell eintragen" />
            <Hint>Keine gespielten Spiele im Spielplan — bitte manuell eintragen.</Hint>
          </Field>
          <Field label="Datum">
            <Input value={data.date} onChange={v => set({ date: v })} placeholder="z.B. 04.07.2026" />
          </Field>
          <Field label="Ort">
            <select className="select" value={data.location ?? "Heimspiel"} onChange={e => set({ location: e.target.value })}>
              <option>Heimspiel</option>
              <option>Auswärts</option>
            </select>
          </Field>
        </>
      )}

      <div className="form-section-title">Ergebnis</div>
      <div className="field-row">
        <Field label="Wir"><NumberInput value={data.home} onChange={v => set({ home: v })} /></Field>
        <Field label="Gegner"><NumberInput value={data.away} onChange={v => set({ away: v })} /></Field>
      </div>
    </>
  );
};
```

- [ ] **Step 2: Build + visual check**

Run: `npm run dev`. Template "Ergebnis": pick a team with played matches → dropdown shows only played games with their score; selecting prefills "Wir"/"Gegner" correctly (away game flips the score). Pokal team with played rounds works the same. Stop with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/MatchResultForm.jsx
git commit -m "feat(result): played-only dropdown with score prefill"
```

## Task 8: Voller Durchlauf + Regeneration

**Files:** none (verification)

- [ ] **Step 1: Full test suite**

Run: `node --test tests/*.test.mjs`
Expected: all PASS.

- [ ] **Step 2: Regenerate data + production build**

Run: `node scripts/build-teams-data.mjs && npm run build`
Expected: teams.json regenerated, Vite build succeeds.

- [ ] **Step 3: Manual visual pass** (`npm run preview` or `npm run dev`):
- Spielankündigung: home, away (badge + wording), pokal home, pokal away.
- Ergebnis: medenspiel home/away score-drehung, pokal result.
- Season-schedule + event-card unchanged.

- [ ] **Step 4: Commit any regenerated data**

```bash
git add src/data/teams.json
git commit -m "chore(data): regenerate teams.json" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage:** Build script reads pokal.yaml (Task 2) + medenspiel result (Task 1) ✓; data model `result` field (Task 1/2) ✓; resolveTeamMode returns pokal matches (Task 3) ✓; away announcement wording + badge, same color, variant C (Tasks 4–6) ✓; announcement dropdown upcoming home+away (Task 6) ✓; result played-only + score drehen (Tasks 4,7) ✓; catalog label rename (Task 5) ✓; ISO→DD.MM.YYYY (Task 2) ✓; edge cases — no away venue → "Auswärts" (Task 5/6), pokal without rounds → free-text (Task 2 fallback + Task 6/7 branch on matches), unparseable result → no prefill (splitResult, Task 4), missing pokal.yaml → fallback (Task 2) ✓; tests (every task) ✓.

**Placeholder scan:** none.

**Type consistency:** match object `{date,time,opponent,home,result}` consistent across Tasks 1–2 and consumed identically in 6/7. `announcementCopy(isHome,variant)→{eyebrow,connector,cta,badge}` and `splitResult(result,isHome)→{us,them}|null` defined in Task 4, used in Tasks 5–7 with matching shapes. `data.isHome` introduced in catalog (Task 5), set by form (Task 6), read by template (Task 5). Score fields `data.home`/`data.away` match MatchResult template (`d.home`/`d.away`).
