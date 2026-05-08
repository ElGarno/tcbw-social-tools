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

export const Wappen = ({ size = 88, style }) => (
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
