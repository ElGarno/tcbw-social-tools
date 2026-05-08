import React from "react";
import { Field, Input, NumberInput, Hint, TeamSelect, TEAMS_DATA } from "../ui.jsx";
import { resolveTeamMode, findMatchIndex } from "../../lib/resolve-team-mode.js";
import { matchLabel } from "../../lib/format-date.js";

export const MatchResultForm = ({ data, set, variant }) => {
  const mode = resolveTeamMode(data.team, variant, TEAMS_DATA);
  const selectedIdx = mode.matches ? findMatchIndex(data.team, data.opponent, data.date, TEAMS_DATA) : -1;

  return (
    <>
      <div className="form-section-title">Mannschaft & Spiel</div>
      <Field label="Mannschaft">
        <TeamSelect value={data.team} onChange={v => {
          const t = TEAMS_DATA[v];
          const newMode = resolveTeamMode(v, variant, TEAMS_DATA);
          if (newMode.isPokal) {
            set({ team: v, league: t.league, opponent: "", date: "", location: "Heimspiel" });
          } else {
            const m = t.matches[0];
            set({
              team: v, league: t.league,
              opponent: m.opponent, date: m.date,
              location: m.home ? "Heimspiel" : "Auswärts",
            });
          }
        }} />
        <Hint>Liga: <strong>{mode.league}</strong></Hint>
      </Field>

      {mode.isPokal ? (
        <>
          <Field label="Gegner">
            <Input value={data.opponent} onChange={v => set({ opponent: v })} placeholder="Gegner manuell eintragen" />
            <Hint>Pokal — nächste Runde unbekannt, bitte manuell eintragen.</Hint>
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
      ) : (
        <Field label="Spiel">
          <select className="select" value={selectedIdx} onChange={e => {
            const m = mode.matches[parseInt(e.target.value, 10)];
            set({ opponent: m.opponent, date: m.date, location: m.home ? "Heimspiel" : "Auswärts" });
          }}>
            {mode.matches.map((m, i) => (
              <option key={i} value={i}>{matchLabel(m)}</option>
            ))}
          </select>
          <Hint>Spielplan aus liga.nu — Datum, Uhrzeit, Heim/Auswärts werden automatisch übernommen.</Hint>
        </Field>
      )}

      <div className="form-section-title">Ergebnis</div>
      <div className="field-row">
        <Field label="Wir"><NumberInput value={data.home} onChange={v => set({ home: v })} /></Field>
        <Field label="Gegner"><NumberInput value={data.away} onChange={v => set({ away: v })} /></Field>
      </div>
    </>
  );
};
