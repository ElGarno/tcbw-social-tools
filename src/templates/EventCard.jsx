import React from "react";
import { Wappen, BrandMark, Eyebrow } from "./shared.jsx";

const EVENT_ACCENTS = {
  blue:   { primary: "#1e56a0", deep: "#0f2240", soft: "#dceafb" },
  orange: { primary: "#f97316", deep: "#9a2e0a", soft: "#fff7ed" },
  green:  { primary: "#10b981", deep: "#059669", soft: "#ecfdf5" },
};

export const EventCard = ({ format = "square", data }) => {
  const W = 1080;
  const H = format === "square" ? 1080 : format === "portrait" ? 1350 : 1920;
  const isStory = format === "story";
  const isSquare = format === "square";

  const d = {
    eyebrow: "Vereinsevent",
    title: "Sommerfest 2026",
    dateLine1: "23. August",
    dateLine2: "15:00 Uhr",
    subline: "Familienprogramm · Schleifchenturnier · Grill",
    location: "Tennisanlage Burg Schnellenberg",
    cta: "Wir freuen uns auf euch",
    ...data
  };

  const a = EVENT_ACCENTS.green;
  const pad = isStory ? 84 : isSquare ? 60 : 72;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        background: "#fff",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
        color: "var(--gray-800)"
      }}>

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: a.primary }} />

      <div
        style={{
          position: "absolute",
          bottom: -220,
          left: -220,
          width: 640,
          height: 640,
          background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent 65%)",
          pointerEvents: "none"
        }} />


      <div
        style={{
          position: "absolute",
          top: pad,
          left: pad,
          right: pad,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24
        }}>

        <Eyebrow scale={1.5} color={a.deep}>{d.eyebrow}</Eyebrow>
        <Wappen size={isStory ? 130 : 110} />
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: pad,
          right: pad,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: isStory ? 36 : isSquare ? 22 : 30
        }}>

        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: isStory ? 130 : isSquare ? 88 : 116,
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
            color: "var(--blue-700)"
          }}>

          {d.title}
        </div>

        <div
          style={{
            width: isStory ? 130 : 100,
            height: 6,
            background: a.primary,
            borderRadius: 3
          }} />


        <div style={{ display: "flex", alignItems: "baseline", gap: isStory ? 28 : 18, flexWrap: "wrap" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: isStory ? 108 : isSquare ? 72 : 96,
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              color: "var(--gray-800)"
            }}>

            {d.dateLine1}
          </div>
          <div
            style={{ ...{
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: isStory ? 56 : isSquare ? 38 : 50,
                color: a.deep,
                letterSpacing: "0.01em",
                lineHeight: 1
              }, color: "rgb(6, 150, 104)" }}>

            · {d.dateLine2}
          </div>
        </div>

        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: isStory ? 34 : isSquare ? 26 : 32,
            color: "var(--gray-600)",
            lineHeight: 1.35,
            maxWidth: "92%"
          }}>

          {d.subline}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: pad,
          left: pad,
          right: pad,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24
        }}>

        <div style={{ display: "flex", flexDirection: "column", gap: isStory ? 8 : 4, maxWidth: "70%" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: isStory ? 36 : isSquare ? 24 : 32,
              color: "var(--blue-700)",
              lineHeight: 1.1
            }}>

            {d.cta}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: isStory ? 24 : isSquare ? 17 : 22,
              color: "var(--gray-500)"
            }}>

            {d.location}
          </div>
        </div>
        <BrandMark tone="light" scale={isStory ? 1.4 : 1.15} />
      </div>
    </div>);

};
