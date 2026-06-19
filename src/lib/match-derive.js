/** Wording for a match announcement, derived from home/away + variant. Color is unchanged. */
export function announcementCopy(isHome, variant) {
  const pokal = variant === "pokal";
  if (isHome) {
    return {
      eyebrow: pokal ? "Pokal-Heimspiel" : "Nächstes Heimspiel",
      connector: "vs.",
      cta: "Komm vorbei",
      badge: null,
    };
  }
  return {
    eyebrow: pokal ? "Pokal-Auswärtsspiel" : "Auswärtsspiel",
    connector: "bei",
    cta: "Daumen drücken",
    badge: "Auswärts",
  };
}

/** Split a liga.nu "home:guest" result into our/their score from our perspective. */
export function splitResult(result, isHome) {
  if (!result) return null;
  const m = String(result).match(/(\d+):(\d+)/);
  if (!m) return null;
  const [, home, guest] = m;
  return isHome ? { us: home, them: guest } : { us: guest, them: home };
}
