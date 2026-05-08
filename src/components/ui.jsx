import React from "react";
import teamsData from "../data/teams.json";

export const TEAM_OPTIONS = Object.keys(teamsData);
export const TEAMS_DATA = teamsData;

export const TeamSelect = ({ value, onChange }) => (
  <select className="select" value={value ?? ""} onChange={e => onChange(e.target.value)}>
    {TEAM_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
  </select>
);

export const Field = ({ label, children }) => (
  <label className="field">
    <span className="label">{label}</span>
    {children}
  </label>
);

export const Input = ({ value, onChange, ...rest }) => (
  <input className="input" value={value ?? ""} onChange={e => onChange(e.target.value)} {...rest} />
);

export const NumberInput = ({ value, onChange }) => (
  <input
    className="input" type="number" min="0" max="20"
    value={value ?? 0}
    onChange={e => onChange(parseInt(e.target.value || "0", 10))}
  />
);

export const Hint = ({ children }) => (
  <span style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 2, lineHeight: 1.4 }}>
    {children}
  </span>
);
