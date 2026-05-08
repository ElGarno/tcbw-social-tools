import React from "react";
import { Field, Input, Hint, TeamSelect, TEAMS_DATA } from "../ui.jsx";
import { resolveTeamMode } from "../../lib/resolve-team-mode.js";
import { formatDateLong, matchLabel } from "../../lib/format-date.js";

export const MatchAnnouncementForm = ({ data, set, variant }) => {
  const mode = resolveTeamMode(data.team, variant, TEAMS_DATA);
  const homeMatches = mode.matches?.filter(m => m.home) ?? null;
  const selectedIdx = homeMatches
    ? homeMatches.findIndex(m => m.opponent === data.opponent && formatDateLong(m.date) === data.dateLine1)
    : -1;

  return (
    <>
      <div className="form-section-title">Mannschaft & Spiel</div>
      <Field label="Mannschaft">
        <TeamSelect value={data.team} onChange={v => {
          const t = TEAMS_DATA[v];
          const newMode = resolveTeamMode(v, variant, TEAMS_DATA);
          if (newMode.isPokal) {
            set({ team: v, league: t.league, opponent: "", dateLine1: "", dateLine2: "" });
          } else {
            const home = t.matches.filter(m => m.home);
            const m = home[0] ?? t.matches[0];
            set({
              team: v, league: t.league,
              opponent: m.opponent,
              dateLine1: formatDateLong(m.date),
              dateLine2: m.time + " Uhr",
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
          <div className="field-row">
            <Field label="Datum"><Input value={data.dateLine1} onChange={v => set({ dateLine1: v })} placeholder="30. Mai" /></Field>
            <Field label="Uhrzeit"><Input value={data.dateLine2} onChange={v => set({ dateLine2: v })} placeholder="13:00 Uhr" /></Field>
          </div>
        </>
      ) : homeMatches && homeMatches.length > 0 ? (
        <Field label="Heimspiel">
          <select className="select" value={selectedIdx} onChange={e => {
            const m = homeMatches[parseInt(e.target.value, 10)];
            set({
              opponent: m.opponent,
              dateLine1: formatDateLong(m.date),
              dateLine2: m.time + " Uhr",
            });
          }}>
            {homeMatches.map((m, i) => (
              <option key={i} value={i}>{matchLabel(m)}</option>
            ))}
          </select>
          <Hint>Nur Heimspiele — Datum & Uhrzeit werden aus liga.nu übernommen.</Hint>
        </Field>
      ) : (
        <Hint>Diese Mannschaft hat keine Heimspiele in der aktuellen Saison.</Hint>
      )}

      <div className="form-section-title">Beschriftung</div>
      <Field label="Eyebrow (oben)"><Input value={data.eyebrow} onChange={v => set({ eyebrow: v })} placeholder="z.B. Nächstes Heimspiel" /></Field>
      <Field label="CTA (unten)"><Input value={data.cta} onChange={v => set({ cta: v })} placeholder="z.B. Komm vorbei" /></Field>
      <Field label="Ort"><Input value={data.location} onChange={v => set({ location: v })} /></Field>
    </>
  );
};
