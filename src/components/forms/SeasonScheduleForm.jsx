import React from "react";
import { Field, Input } from "../ui.jsx";

export const SeasonScheduleForm = ({ data, set }) => (
  <>
    <div className="form-section-title">Header</div>
    <Field label="Eyebrow"><Input value={data.eyebrow} onChange={v => set({ eyebrow: v })} /></Field>
    <Field label="Titel"><Input value={data.title} onChange={v => set({ title: v })} /></Field>
    <Field label="Untertitel"><Input value={data.subtitle} onChange={v => set({ subtitle: v })} /></Field>
    <Field label="Slogan"><Input value={data.slogan} onChange={v => set({ slogan: v })} /></Field>
    <div className="form-section-title">Mannschaften</div>
    <div style={{ fontSize: 12, color: "var(--gray-500)", lineHeight: 1.5 }}>
      Die Mannschaftsliste kommt aus dem Spielplan-Datensatz und wird automatisch verwendet.
    </div>
  </>
);
