import React from "react";
import { CourtLines, Wappen, BrandMark, Eyebrow } from "./shared.jsx";

/**
 * MatchAnnouncement — one component, three formats, two variants.
 * @param format "square" (1080x1080) | "portrait" (1080x1350) | "story" (1080x1920)
 * @param variant "league" | "pokal"
 */
export const MatchAnnouncement = ({ format = "portrait", variant = "league", data }) => {
  const W = 1080;
  const H = format === "square" ? 1080 : format === "portrait" ? 1350 : 1920;
  const isStory = format === "story";
  const isSquare = format === "square";

  const d = {
    team: "Herren 40",
    opponent: "TC Iserlohn",
    dateLine1: "30. Mai",
    dateLine2: "13:00 Uhr",
    league: "Südwestfalenliga",
    location: "Tennisanlage Burg Schnellenberg",
    cta: "Komm vorbei",
    eyebrow: variant === "pokal" ? "Pokal-Heimspiel" : "Nächstes Heimspiel",
    ...data,
  };

  const accent = variant === "pokal" ? "#f97316" : "#1e56a0";
  const accentDeep = variant === "pokal" ? "#9a2e0a" : "#0f2240";

  // Court image (used as bg, with dark overlay)
  const bgImage = "/foto-anlage-2.jpg";

  // Vertical pad
  const pad = isStory ? 84 : isSquare ? 60 : 70;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
        color: "#fff",
        background: "#0a1628",
      }}
    >
      {/* Background photo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.85)",
        }}
      />
      {/* Color wash + dark overlay for legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: variant === "pokal"
            ? "linear-gradient(180deg, rgba(20, 8, 0, 0.62) 0%, rgba(154, 46, 10, 0.55) 50%, rgba(10, 5, 0, 0.85) 100%)"
            : "linear-gradient(180deg, rgba(10, 22, 40, 0.55) 0%, rgba(15, 34, 64, 0.7) 50%, rgba(10, 22, 40, 0.92) 100%)",
        }}
      />
      {/* Court line decoration in upper third */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", opacity: 0.12 }}>
        <CourtLines color="#ffffff" strokeScale={3} opacity={1} />
      </div>

      {/* TOP ROW */}
      <div
        style={{
          position: "absolute",
          top: pad,
          left: pad,
          right: pad,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          zIndex: 2,
        }}
      >
        <Eyebrow
          scale={1.6}
          color={variant === "pokal" ? "#fb923c" : "var(--blue-200)"}
        >
          {d.eyebrow}
        </Eyebrow>
        <Wappen size={isStory ? 130 : 110} />
      </div>

      {/* MAIN CONTENT — vertically centered block */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: isStory ? 40 : 28,
          zIndex: 2,
        }}
      >
        {/* Team */}
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: isStory ? 56 : isSquare ? 44 : 52,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          {d.team}
        </div>

        {/* "vs. opponent" — display serif, large */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: isStory ? 132 : isSquare ? 92 : 116,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: "#fff",
          }}
        >
          <span style={{ fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.6)", marginRight: 18 }}>
            vs.
          </span>
          {d.opponent}
        </div>

        {/* Accent bar */}
        <div
          style={{
            width: isStory ? 130 : 100,
            height: 6,
            background: accent,
            marginTop: isStory ? 16 : 8,
            marginBottom: isStory ? 16 : 8,
            borderRadius: 3,
          }}
        />

        {/* Date — biggest emphasis */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: isStory ? 24 : 18,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: isStory ? 168 : isSquare ? 116 : 144,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#fff",
            }}
          >
            {d.dateLine1}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: isStory ? 64 : isSquare ? 48 : 60,
            color: variant === "pokal" ? "#fdba74" : "#93c5fd",
            letterSpacing: "0.01em",
            lineHeight: 1,
            marginTop: isStory ? -16 : -8,
            textShadow: "0 2px 12px rgba(0,0,0,0.45)",
          }}
        >
          {d.dateLine2}
        </div>

        {/* League */}
        <div
          style={{
            marginTop: isStory ? 14 : 6,
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: isStory ? 30 : isSquare ? 24 : 28,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.03em",
          }}
        >
          {variant === "pokal" ? "WTV Vereinspokal" : d.league}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div
        style={{
          position: "absolute",
          bottom: pad,
          left: pad,
          right: pad,
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: isStory ? 10 : 6, maxWidth: "75%" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: isStory ? 44 : isSquare ? 32 : 40,
                color: "#fff",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              {d.cta} —
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: isStory ? 26 : isSquare ? 19 : 24,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.3,
              }}
            >
              {d.location}
            </div>
          </div>

          <BrandMark tone="dark" scale={isStory ? 1.4 : 1.15} />
        </div>
      </div>
    </div>
  );
};
