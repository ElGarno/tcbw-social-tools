import React from "react";
import { CourtLines, Wappen, BrandMark, Eyebrow } from "./shared.jsx";

const ACCENTS = {
  win:  { primary: "#1e56a0", deep: "#0f2240", soft: "#dceafb", tag: "Heimsieg" },
  loss: { primary: "#4b5563", deep: "#1f2937", soft: "#e2e5ea", tag: "Heimspiel" },
  pokal:{ primary: "#f97316", deep: "#9a2e0a", soft: "#fff7ed", tag: "Pokal" },
};

/**
 * MatchResult — one component, two formats (square / story), three variants.
 * @param format "square" (1080x1080) | "story" (1080x1920)
 * @param variant "win" | "loss" | "pokal"
 */
export const MatchResult = ({ format = "square", variant = "win", data }) => {
  const isStory = format === "story";
  const W = 1080;
  const H = isStory ? 1920 : 1080;
  const a = ACCENTS[variant];
  const isLoss = variant === "loss";

  // Default sample data
  const d = {
    team: "Herren 30",
    home: 6,
    away: 3,
    opponent: "Olper TC",
    date: "04.07.2026",
    location: "Heimspiel",
    league: "Kreisliga",
    ...data,
  };

  // Background depends on variant:
  // win  -> hero gradient (deep navy) with court lines
  // loss -> light neutral, contained
  // pokal-> hero gradient with orange tint via overlay
  const bg = isLoss
    ? "var(--gray-50)"
    : variant === "pokal"
    ? "linear-gradient(160deg, #1a1530 0%, #2a1810 50%, #3d1908 100%)"
    : "linear-gradient(160deg, var(--blue-700) 0%, var(--blue-800) 40%, var(--blue-900) 100%)";

  const onDark = !isLoss;
  const fg = onDark ? "#fff" : "var(--gray-800)";
  const fgMuted = onDark ? "var(--blue-200)" : "var(--gray-500)";
  const fgQuiet = onDark ? "rgba(255,255,255,0.55)" : "var(--gray-400)";

  // Layout pads scale with format
  const pad = isStory ? 80 : 64;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        background: bg,
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
        color: fg,
      }}
    >
      {/* Decorative court lines on dark variants */}
      {onDark && (
        <CourtLines
          opacity={variant === "pokal" ? 0.10 : 0.13}
          color="#ffffff"
          strokeScale={3}
        />
      )}

      {/* Soft radial highlight */}
      {onDark && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: variant === "pokal"
              ? "radial-gradient(circle at 80% 0%, rgba(249,115,22,0.25), transparent 55%), radial-gradient(circle at 0% 100%, rgba(249,115,22,0.12), transparent 60%)"
              : "radial-gradient(circle at 80% 0%, rgba(106,163,235,0.22), transparent 55%), radial-gradient(circle at 0% 100%, rgba(58,123,213,0.14), transparent 60%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* TOP ROW — team name (left) + wappen (right) */}
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
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Eyebrow scale={1.4} color={a.primary === "#4b5563" ? "var(--gray-500)" : a.primary === "#1e56a0" ? "var(--blue-300)" : "#fb923c"}>
            {variant === "pokal" ? "WTV Vereinspokal" : a.tag}
          </Eyebrow>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: isStory ? 92 : 76,
              lineHeight: 1.0,
              letterSpacing: "-0.025em",
              color: fg,
            }}
          >
            {d.team}
          </div>
        </div>
        <Wappen size={isStory ? 130 : 110} style={{ flexShrink: 0 }} />
      </div>

      {/* CENTER — score */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          textAlign: "center",
          padding: `0 ${pad}px`,
        }}
      >
        {/* small label above score */}
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: isStory ? 22 : 19,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: fgQuiet,
            marginBottom: isStory ? 36 : 28,
          }}
        >
          Endstand
        </div>

        {/* Score */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: isStory ? 380 : 300,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            color: fg,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: isStory ? 50 : 36,
          }}
        >
          <span style={{ minWidth: isStory ? 200 : 160, textAlign: "right" }}>{d.home}</span>
          <span
            style={{
              color: a.primary,
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: isStory ? 320 : 250,
              lineHeight: 1,
              transform: "translateY(-8px)",
            }}
          >
            :
          </span>
          <span
            style={{
              minWidth: isStory ? 200 : 160,
              textAlign: "left",
              color: isLoss ? "var(--gray-500)" : fg,
              opacity: isLoss ? 0.7 : 1,
            }}
          >
            {d.away}
          </span>
        </div>

        {/* vs. opponent */}
        <div
          style={{
            marginTop: isStory ? 40 : 30,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: isStory ? 56 : 46,
            color: fg,
            letterSpacing: "-0.01em",
          }}
        >
          vs. {d.opponent}
        </div>

        {/* date */}
        <div
          style={{
            marginTop: isStory ? 22 : 16,
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: isStory ? 30 : 26,
            color: fgMuted,
            letterSpacing: "0.02em",
          }}
        >
          {d.date} · {d.location}
        </div>
      </div>

      {/* BOTTOM — League badge (right) + brand (left) */}
      <div
        style={{
          position: "absolute",
          bottom: pad,
          left: pad,
          right: pad,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
        }}
      >
        <BrandMark tone={onDark ? "dark" : "light"} scale={isStory ? 1.6 : 1.4} />

        {/* League pill */}
        <div
          style={{
            background: variant === "pokal"
              ? a.primary
              : isLoss
              ? "var(--white)"
              : "rgba(255,255,255,0.96)",
            color: variant === "pokal" ? "#fff" : "var(--blue-700)",
            padding: isStory ? "14px 28px" : "12px 22px",
            borderRadius: 999,
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: isStory ? 22 : 18,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            boxShadow: onDark ? "0 4px 16px rgba(0,0,0,0.3)" : "var(--shadow-md)",
            border: isLoss ? "1px solid var(--gray-200)" : "none",
            whiteSpace: "nowrap",
          }}
        >
          {variant === "pokal" ? "WTV Vereinspokal" : d.league}
        </div>
      </div>
    </div>
  );
};
