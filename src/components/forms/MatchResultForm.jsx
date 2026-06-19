import React from "react";
import { Field, Input, NumberInput, Hint, TeamSelect, TEAMS_DATA } from "../ui.jsx";
import { resolveTeamMode } from "../../lib/resolve-team-mode.js";
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
