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
