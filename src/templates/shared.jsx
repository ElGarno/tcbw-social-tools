import React from "react";

export const CourtLines = ({ opacity = 0.14, color = "#ffffff", strokeScale = 1 }) => {
  const stroke = 2 * strokeScale;
  const s = { position: "absolute", inset: 0, opacity, pointerEvents: "none" };
  return (
    <div style={s}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <rect x="15" y="20" width="70" height="60" fill="none" stroke={color} strokeWidth={stroke * 0.25} />
        <line x1="22" y1="20" x2="22" y2="80" stroke={color} strokeWidth={stroke * 0.25} />
        <line x1="78" y1="20" x2="78" y2="80" stroke={color} strokeWidth={stroke * 0.25} />
        <line x1="15" y1="50" x2="85" y2="50" stroke={color} strokeWidth={stroke * 0.35} />
        <line x1="22" y1="35" x2="78" y2="35" stroke={color} strokeWidth={stroke * 0.25} />
        <line x1="22" y1="65" x2="78" y2="65" stroke={color} strokeWidth={stroke * 0.25} />
        <line x1="50" y1="35" x2="50" y2="65" stroke={color} strokeWidth={stroke * 0.25} />
      </svg>
    </div>
  );
};

// Fixed layout (percent of canvas) so every export looks the same; kept mostly
// right and top so the left-aligned text stays readable.
const FLAKES = [
  { x: 88, y: 18, size: 70, opacity: 0.35, rotate: 10 },
  { x: 72, y: 9, size: 34, opacity: 0.3, rotate: 25 },
  { x: 94, y: 36, size: 40, opacity: 0.25, rotate: 0 },
  { x: 80, y: 47, size: 96, opacity: 0.18, rotate: 15 },
  { x: 62, y: 28, size: 26, opacity: 0.3, rotate: 40 },
  { x: 91, y: 62, size: 30, opacity: 0.3, rotate: 5 },
  { x: 70, y: 70, size: 48, opacity: 0.2, rotate: 30 },
  { x: 48, y: 13, size: 22, opacity: 0.28, rotate: 20 },
  { x: 55, y: 82, size: 28, opacity: 0.22, rotate: 12 },
  { x: 8, y: 26, size: 24, opacity: 0.22, rotate: 35 },
];

const Snowflake = ({ size, color }) => (
  <svg viewBox="-12 -12 24 24" width={size} height={size} style={{ display: "block" }}>
    {[0, 60, 120].map(a => (
      <g key={a} transform={`rotate(${a})`} stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none">
        <line x1="0" y1="-11" x2="0" y2="11" />
        <polyline points="-3,-9 0,-6.5 3,-9" />
        <polyline points="-3,9 0,6.5 3,9" />
      </g>
    ))}
  </svg>
);

export const Snowflakes = ({ color = "#ffffff" }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {FLAKES.map((f, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${f.x}%`,
          top: `${f.y}%`,
          opacity: f.opacity,
          transform: `translate(-50%, -50%) rotate(${f.rotate}deg)`,
        }}
      >
        <Snowflake size={f.size} color={color} />
      </div>
    ))}
  </div>
);

export const Wappen =({ size = 88, style }) => (
  <img
    src="/wappen.png"
    alt="TC BW Attendorn Wappen"
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      display: "block",
      ...style,
    }}
  />
);

export const BrandMark = ({ tone = "light", scale = 1 }) => {
  const isDark = tone === "dark";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
      <Wappen size={44 * scale} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 16 * scale,
          color: isDark ? "#fff" : "var(--blue-700)",
          letterSpacing: "-0.01em",
        }}>
          TC Blau-Weiss Attendorn
        </span>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          fontSize: 11 * scale,
          color: isDark ? "var(--blue-200)" : "var(--gray-500)",
          letterSpacing: "0.04em",
          marginTop: 2 * scale,
        }}>
          @tcbwattendorn · Seit 1931
        </span>
      </div>
    </div>
  );
};

export const Eyebrow = ({ children, color, scale = 1, style }) => (
  <div style={{
    fontFamily: "var(--font-sans)",
    fontWeight: 600,
    fontSize: 13 * scale,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color,
    ...style,
  }}>
    {children}
  </div>
);
