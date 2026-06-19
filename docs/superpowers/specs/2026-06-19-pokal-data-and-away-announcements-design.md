# Spec: Pokal-Daten + Auswärts-Ankündigungen + Ergebnis-Prefill

**Status:** Design — freigegeben, Implementierungsplanung offen
**Datum:** 2026-06-19
**Repo:** `tcbw-social-tools`
**Verwandt:** tcbw-homepage Pokalbaum-Feature (`docs/superpowers/specs/2026-06-13-pokalbaum-frontend-design.md`)

## Ausgangslage / Ziel

Der Social-Media-Generator liest seine Mannschaftsdaten zur Build-Zeit aus
`../tcbw-homepage/content/mannschaften/*.md`. Heute gilt:

- **Pokal** ist im Generator nur Freitext (`POKAL_TEAMS` mit `matches: null`,
  `isPokal: true`), obwohl tcbw-homepage seit dem Pokalbaum-Feature die
  vollständigen Pokal-Pfade in `../tcbw-homepage/data/pokal.yaml` pflegt.
- **Spielankündigungen** gibt es nur für Heimspiele (`MatchAnnouncementForm`
  filtert `matches.filter(m => m.home)`).
- **Medenspiel-Matches** tragen kein Ergebnis (der Build-Script ignoriert die
  Ergebnis-Spalte der MD-Tabellen).

Ziel: Pokal-Spiele genauso per Dropdown wählbar machen wie Medenspiele
(Heim/Auswärts, mit Ergebnis); Ankündigungen auch für Auswärtsspiele; und
Ergebnis-Prefill — einheitlich für Medenspiel und Pokal.

## Entscheidungen (aus Brainstorming)

| Entscheidung | Wahl | Begründung |
|---|---|---|
| Auswärts-Ankündigung Optik | **C — gleiche Farbe, Unterscheidung über Wording + „Auswärts"-Badge** | Keine neue Signalfarbe; beißt sich nicht mit Pokal-Orange/Event-Grün; einfachste Umsetzung |
| Datenmodell | **Konsistent — Ergebnisse überall mitlesen** | Geringer Mehraufwand (Spalte ist da); Ankündigungs-Dropdown kann gespielte Spiele ausblenden, Ergebnis-Dropdown Score vorfüllen |
| Auswärts-Ortszeile | Default „Auswärts" (Gegner-Anlage unbekannt) | Keine zuverlässige Adressquelle |

## Datenmodell

### Match-Objekt (in `src/data/teams.json`)

Pro Match neu das Feld `result` (`string` wie `"6:3"` oder `null` = offen):

```json
{ "date": "30.05.2026", "time": "13:00", "opponent": "TC Iserlohn", "home": true, "result": null }
```

`date` bleibt das deutsche Format `DD.MM.YYYY` (wie bisher aus den MD-Tabellen,
kompatibel mit `formatDateLong`/`matchLabel`).

### Team-Eintrag

```json
{
  "Herren-Pokal LK 18–25": {
    "league": "WTV Vereinspokal",
    "isPokal": true,
    "matches": [ { "date": "...", "time": "...", "opponent": "...", "home": true, "result": "2:1" }, ... ]
  }
}
```

Pokal-Teams behalten `isPokal: true` (steuert den Orange-Look der Templates),
haben aber jetzt echte `matches`.

### Quelle `../tcbw-homepage/data/pokal.yaml`

Form (vom homepage-nuliga-sync gepflegt):

```yaml
teams:
  - slug: "herren-lk18-25"
    label: "Herren-Pokal LK 18–25"
    detail: "WTV Vereinspokal · Herren LK 18,0–25,0"
    liga_url: "..."
    rounds:
      - { branch: haupt, round: 1, date: 2026-05-05, time: "18:00", home: true, opponent: "TV Rönkhausen 1892 TA", result: "2:1", outcome: win }
```

Mapping pro Team: `label` → teams.json-Key; `league` = `"WTV Vereinspokal"`;
jede `round` → ein Match `{ date: ISO→DD.MM.YYYY, time, opponent, home, result }`.
`branch`/`round`/`outcome` werden nicht in teams.json übernommen (für die
Templates irrelevant). **ISO-Datum (`YYYY-MM-DD`) muss zu `DD.MM.YYYY`
konvertiert werden.**

## Komponenten

### 1. `scripts/build-teams-data.mjs`

- **Medenspiel:** `parseTeamMd` extrahiert zusätzlich die 5. Spalte (Ergebnis).
  Tabellen-Zelle `"-"` oder leer → `result: null`, sonst der String (z. B.
  `"6:3"`). Bestehende Felder unverändert.
- **Pokal:** Neue Funktion `parsePokalYaml(yamlText)` (mit `gray-matter`s
  mitgeliefertem `js-yaml`, oder `js-yaml` als Dev-Dep ergänzen) liest
  `../tcbw-homepage/data/pokal.yaml`, mappt jedes Team auf einen teams.json-
  Eintrag mit echten Matches (ISO→DD.MM.YYYY). Ersetzt den hartkodierten
  `POKAL_TEAMS`-Block. Fehlt die Datei / ist leer → Pokal-Teams mit
  `matches: null` (heutiger Freitext-Fallback bleibt erhalten).
- Helper `isoToGerman("2026-05-05") → "05.05.2026"`.

### 2. `src/lib/resolve-team-mode.js`

`resolveTeamMode` gibt für Pokal-Teams jetzt die echten Matches zurück, behält
aber `isPokal`:

```js
return {
  isPokal,                                   // weiterhin für Orange-Styling
  league: t?.league ?? "",
  matches: t?.matches ?? null,               // nicht mehr zwangs-null bei Pokal
};
```

`isPokal` bleibt = `isPokalTeam || isPokalVariant`. Freitext-Modus greift jetzt
nur noch, wenn `matches` fehlt (z. B. Pokal-Team ohne Runden).

### 3. Ankündigung — `MatchAnnouncement.jsx` + `MatchAnnouncementForm.jsx`

- **Form:** Dropdown zeigt jetzt **alle ungespielten** Matches
  (`matches.filter(m => !m.result)`), Heim **und** Auswärts (statt nur Heim).
  Label via `matchLabel` (zeigt schon „(Heim)"/„(Auswärts)"). Auswahl setzt
  `opponent`, `dateLine1` (aus `formatDateLong`), `dateLine2` (Zeit) und ein
  neues Feld `isHome`.
- **Template:** Neues `data.isHome` (Default `true`) steuert:
  - Eyebrow: `isHome` → (`pokal` ? „Pokal-Heimspiel" : „Nächstes Heimspiel"),
    sonst (`pokal` ? „Pokal-Auswärtsspiel" : „Auswärtsspiel").
  - Connector vor dem Gegner: `isHome` ? „vs." : „bei".
  - Default-CTA: `isHome` ? „Komm vorbei" : „Daumen drücken" (bleibt editierbar).
  - Auswärts: kleines „Auswärts"-Badge (oben, z. B. rot) + Ortszeile-Default
    „Auswärts".
  - **Farbe/Variant unverändert** (Blau bzw. Pokal-Orange).
- **Catalog:** `match-announcement.label` „Heimspiel" → „Spielankündigung";
  `sublabel` anpassen. Default `isHome: true`.

### 4. Ergebnis — `MatchResultForm.jsx`

- Dropdown zeigt nur **gespielte** Matches (`matches.filter(m => m.result)`).
- Auswahl füllt `opponent`, `date`, `location` (Heim/Auswärts) **und** den Score
  aus unserer Perspektive vor:
  - Ergebnis-String `"a:b"` ist liga.nu-Konvention `home:guest`.
  - Heim: `data.home = a`, `data.away = b`. Auswärts: `data.home = b`,
    `data.away = a` (Felder `home`/`away` = „Wir"/„Gegner" im Template).
  - Helper `splitResult("6:3", isHome) → { us, them }`.
- Manuelles Editieren bleibt möglich (Freitext-Fallback bei Pokal ohne Matches).

## Edge Cases

- Auswärts ohne bekannte Anlage → Ortszeile-Default „Auswärts" (editierbar).
- Pokal-Team ohne Runden in `pokal.yaml` → `matches: null` → Freitext wie heute.
- Ergebnis-String nicht parsebar (kein `a:b`) → kein Score-Prefill, Felder leer
  lassen, kein Crash.
- `pokal.yaml` fehlt (homepage-Repo nicht ausgecheckt) → Build bricht nicht ab;
  Pokal fällt auf Freitext zurück (Warnung loggen).

## Test-Strategie (`node --test tests/*.test.mjs`)

- **`build-teams-data.test.mjs` (erweitern):**
  - `parseTeamMd` liest die Ergebnis-Spalte (`"6:3"` → `result:"6:3"`, `"-"` →
    `null`).
  - `parsePokalYaml` mappt YAML-Runden → Matches mit ISO→DD.MM.YYYY,
    `result`/`home` korrekt; fehlende/leere Datei → Freitext-Fallback.
  - `isoToGerman` Konvertierung.
- **`resolve-team-mode.test.mjs` (erweitern):** Pokal-Team mit Matches gibt
  Matches + `isPokal:true` zurück; Pokal-Team ohne Matches → `matches:null`.
- **Neue Helper-Tests:** `splitResult` (Heim vs. Auswärts Score-Drehung,
  unparsebarer String), Ankündigungs-Wording-Ableitung (`isHome` →
  Eyebrow/Connector/CTA/Badge).
- **Visuell (manuell):** Heim-/Auswärts-/Pokal-Ankündigung + Ergebnis-Prefill in
  der Live-Preview prüfen.

## Akzeptanzkriterien

- `npm run build`/`prebuild` erzeugt `teams.json` mit Pokal-Matches aus
  `data/pokal.yaml` und `result` für alle Matches (Medenspiel + Pokal).
- Pokal-Teams sind im Mannschafts-Dropdown wählbar und liefern echte Spiele
  (kein Freitext, solange Runden existieren).
- Spielankündigung funktioniert für Heim **und** Auswärts; Auswärts wird über
  Eyebrow/Connector/CTA + „Auswärts"-Badge kenntlich gemacht, gleiche Farbe.
- Ergebnis-Dropdown zeigt nur gespielte Spiele und füllt den Score korrekt
  gedreht vor.
- `node --test` grün inkl. neuer Tests.
- Keine Doppelpflege: einzige Datenquelle bleibt tcbw-homepage.

## Nicht im Scope

- Auswärts-Anlagen-Adressen (keine Quelle).
- Pokal-Baum/Bracket-Grafik im Generator (das rendert die Homepage).
- Automatischer Rebuild-Trigger bei homepage-Änderungen (bleibt manueller Build).
- Änderungen am `season-schedule`/`event-card`-Template.
