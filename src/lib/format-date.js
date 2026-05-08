const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export function formatDateLong(ddmmyyyy) {
  if (!ddmmyyyy) return "";
  const [d, m] = ddmmyyyy.split(".");
  return `${parseInt(d, 10)}. ${MONTHS_DE[parseInt(m, 10) - 1]}`;
}

export function matchLabel(match) {
  return `${match.date.slice(0, 5)} · ${match.opponent} (${match.home ? "Heim" : "Auswärts"})`;
}
