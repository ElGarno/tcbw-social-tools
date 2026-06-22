import React from "react";
import { Field, Input, NumberInput, Hint, TeamSelect, TEAMS_DATA } from "../ui.jsx";
import { resolveTeamMode } from "../../lib/resolve-team-mode.js";
import { matchLabel } from "../../lib/format-date.js";
import { splitResult } from "../../lib/match-derive.js";

export const MatchResultForm = ({ data, set, variant, setVariant }) => {
  const mode = resolveTeamMode(data.team, variant, TEAMS_DATA);
  // All scheduled matches — also those without a result yet (not yet on liga.nu).
  // The score is prefilled when liga.nu already has it, otherwise entered manually.
  const matches = mode.matches ?? null;
  const hasMatches = matches && matches.length > 0;
  const selectedIdx = hasMatches
    ? matches.findIndex(m => m.opponent === data.opponent && m.date === data.date)
    : -1;

  const applyMatch = (m) => {
    const score = splitResult(m.result, m.home);
    set({
      opponent: m.opponent,
      date: m.date,
      location: m.home ? "Heimspiel" : "Auswärts",
      // Prefill score from liga.nu when available, otherwise reset for manual entry.
      ...(score ? { home: score.us, away: score.them } : { home: 0, away: 0 }),
    });
    // Auto-select the design (Sieg/Niederlage) from the fetched score.
    // A deliberate Pokal choice is kept; draws leave the variant untouched.
    if (score && variant !== "pokal") {
      const us = Number(score.us);
      const them = Number(score.them);
      if (us !== them) setVariant(us > them ? "win" : "loss");
    }
  };

  return (
    <>
      <div className="form-section-title">Mannschaft & Spiel</div>
      <Field label="Mannschaft">
        <TeamSelect value={data.team} onChange={v => {
          const t = TEAMS_DATA[v];
          const ms = t.matches ?? null;
          if (ms && ms.length > 0) {
            set({ team: v, league: t.league });
            applyMatch(ms[0]);
          } else {
            set({ team: v, league: t.league, opponent: "", date: "", location: "Heimspiel" });
          }
        }} />
        <Hint>Liga: <strong>{mode.league}</strong></Hint>
      </Field>

      {hasMatches ? (
        <Field label="Spiel">
          <select className="select" value={selectedIdx} onChange={e => {
            applyMatch(matches[parseInt(e.target.value, 10)]);
          }}>
            {matches.map((m, i) => (
              <option key={i} value={i}>{matchLabel(m)}{m.result ? ` — ${m.result}` : " — noch kein Ergebnis"}</option>
            ))}
          </select>
          <Hint>Alle Spiele aus dem Spielplan — Gegner, Datum und Heim/Auswärts werden vorausgefüllt. Liegt das Ergebnis schon auf liga.nu vor, wird es übernommen, sonst unten manuell eintragen.</Hint>
        </Field>
      ) : (
        <>
          <Field label="Gegner">
            <Input value={data.opponent} onChange={v => set({ opponent: v })} placeholder="Gegner manuell eintragen" />
            <Hint>Keine Spiele im Spielplan — bitte manuell eintragen.</Hint>
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
