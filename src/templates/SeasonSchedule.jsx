import React from "react";
import { Wappen, BrandMark, Eyebrow } from "./shared.jsx";

const T34_ACCENTS = {
  blue:   { primary: "#1e56a0", deep: "#0f2240", soft: "#dceafb" },
  orange: { primary: "#f97316", deep: "#9a2e0a", soft: "#fff7ed" },
  green:  { primary: "#10b981", deep: "#059669", soft: "#ecfdf5" },
};

export const SeasonSchedule = ({ format = "portrait", data }) => {
  const W = 1080;
  const H = format === "story" ? 1920 : 1350;
  const isStory = format === "story";

  const d = {
    eyebrow: "Saison 2026",
    title: "Unsere Mannschaften",
    subtitle: "Sommer 2026",
    teams: [
    { name: "Damen", league: "Bezirksliga" },
    { name: "Herren 30", league: "Kreisliga" },
    { name: "Herren 40", league: "Südwestfalenliga" },
    { name: "Herren 60", league: "Bezirksliga" },
    { name: "Gemischt 1", league: "Bezirksklasse" },
    { name: "Gemischt 2", league: "Kreisklasse" },
    { name: "Mixed U12", league: "Kreisklasse" }],

    pokal: [
    { name: "Herren-Pokal", league: "WTV Vereinspokal" },
    { name: "Herren 40-Pokal", league: "WTV Vereinspokal" }],

    slogan: "Der an der Burg",
    ...data
  };

  const pad = isStory ? 84 : 70;
  const fsTeam = isStory ? 50 : 42;
  const fsLeague = isStory ? 28 : 23;
  const rowPadY = isStory ? 22 : 17;
  const rowGap = isStory ? 8 : 6;

  const Row = ({ team, league, pokal }) =>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${rowPadY}px 0`,
      borderBottom: "1px solid var(--gray-200)",
      gap: 24
    }}>

      <div style={{ display: "flex", alignItems: "center", gap: isStory ? 24 : 18, minWidth: 0 }}>
        <span
        style={{
          width: isStory ? 14 : 11,
          height: isStory ? 14 : 11,
          borderRadius: 999,
          background: pokal ? "var(--orange-500)" : "var(--blue-500)",
          flexShrink: 0
        }} />

        <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: fsTeam,
          color: "var(--gray-800)",
          letterSpacing: "-0.015em",
          lineHeight: 1.05
        }}>

          {team}
        </span>
      </div>
      <span
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        fontSize: fsLeague,
        color: pokal ? "var(--orange-600)" : "var(--gray-500)",
        letterSpacing: "0.02em",
        textAlign: "right",
        whiteSpace: "nowrap"
      }}>

        {league}
      </span>
    </div>;


  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        background: "#fff",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
        color: "var(--gray-800)",
        display: "flex",
        flexDirection: "column"
      }}>

      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 380,
          height: 380,
          background: "var(--blue-50)",
          borderRadius: "50%",
          zIndex: 0
        }} />


      <div
        style={{
          padding: `${pad}px ${pad}px 0`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          position: "relative",
          zIndex: 1
        }}>

        <div style={{ display: "flex", flexDirection: "column", gap: isStory ? 16 : 12 }}>
          <Eyebrow scale={1.5} color="var(--blue-500)">{d.eyebrow}</Eyebrow>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: isStory ? 88 : 72,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "var(--blue-700)"
            }}>

            {d.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: isStory ? 32 : 26,
              color: "var(--gray-500)",
              letterSpacing: "0.02em"
            }}>

            {d.subtitle}
          </div>
        </div>
        <Wappen size={isStory ? 130 : 110} />
      </div>

      <div
        style={{
          padding: `${isStory ? 56 : 40}px ${pad}px ${isStory ? 32 : 22}px`,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          zIndex: 1
        }}>

        <div style={{ display: "flex", flexDirection: "column", gap: rowGap }}>
          {d.teams.map((t) => <Row key={t.name} team={t.name} league={t.league} />)}
        </div>

        <div
          style={{
            marginTop: isStory ? 36 : 26,
            paddingTop: isStory ? 26 : 20,
            borderTop: "2px solid var(--orange-500)"
          }}>

          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: isStory ? 22 : 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--orange-600)",
              marginBottom: isStory ? 12 : 8
            }}>

            Pokal
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: rowGap }}>
            {d.pokal.map((t) => <Row key={t.name} team={t.name} league={t.league} pokal />)}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: `${isStory ? 26 : 20}px ${pad}px ${pad}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--gray-200)",
          gap: 24,
          position: "relative",
          zIndex: 1
        }}>

        <BrandMark tone="light" scale={isStory ? 1.4 : 1.2} />
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: isStory ? 26 : 21,
            color: "var(--blue-600)",
            letterSpacing: "-0.005em",
            textAlign: "right"
          }}>

          {d.slogan}
        </div>
      </div>
    </div>);

};
