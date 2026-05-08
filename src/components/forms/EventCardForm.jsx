import React from "react";
import { Field, Input } from "../ui.jsx";

export const EventCardForm = ({ data, set }) => (
  <>
    <div className="form-section-title">Event</div>
    <Field label="Eyebrow"><Input value={data.eyebrow} onChange={v => set({ eyebrow: v })} placeholder="z.B. Vereinsevent" /></Field>
    <Field label="Titel"><Input value={data.title} onChange={v => set({ title: v })} placeholder="z.B. Sommerfest 2026" /></Field>

    <div className="form-section-title">Termin</div>
    <div className="field-row">
      <Field label="Datum"><Input value={data.dateLine1} onChange={v => set({ dateLine1: v })} placeholder="23. August" /></Field>
      <Field label="Uhrzeit"><Input value={data.dateLine2} onChange={v => set({ dateLine2: v })} placeholder="15:00 Uhr" /></Field>
    </div>

    <div className="form-section-title">Beschriftung</div>
    <Field label="Untertitel"><Input value={data.subline} onChange={v => set({ subline: v })} placeholder="kurze Beschreibung" /></Field>
    <Field label="CTA"><Input value={data.cta} onChange={v => set({ cta: v })} /></Field>
    <Field label="Ort"><Input value={data.location} onChange={v => set({ location: v })} /></Field>
  </>
);
