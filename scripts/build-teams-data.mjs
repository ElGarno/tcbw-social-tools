import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOMEPAGE_REPO = path.resolve(__dirname, "../../tcbw-homepage");
const MANNSCHAFTEN_DIR = path.join(HOMEPAGE_REPO, "content/mannschaften");
const OUTPUT = path.resolve(__dirname, "../src/data/teams.json");

const HOME_PATTERN = /\*\*TC BW Attendorn(?: \d)?\*\*/;

const TITLE_REMAP = {
  "Damen": "Damen",
  "Herren 30": "Herren 30",
  "Herren 40": "Herren 40",
  "Herren 60": "Herren 60",
  "Gemischte Mannschaft 1": "Gemischt 1",
  "Gemischte Mannschaft 2": "Gemischt 2",
  "Mixed U12": "Mixed U12",
};

const POKAL_DATA = path.join(HOMEPAGE_REPO, "data/pokal.yaml");

// Defensive fallback if data/pokal.yaml is missing (homepage repo not checked out):
// keep pokal teams selectable as free-text (matches: null).
const POKAL_FALLBACK = {
  "Herren-Pokal LK 18–25": { league: "WTV Vereinspokal", matches: null, isPokal: true },
  "Herren-40-Pokal":       { league: "WTV Vereinspokal", matches: null, isPokal: true },
};

export function isoToGerman(iso) {
  // js-yaml may parse unquoted dates as JS Date objects; coerce to ISO string first.
  const isoStr = iso instanceof Date ? iso.toISOString() : String(iso);
  const [y, m, d] = isoStr.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

export function parsePokalYaml(yamlText) {
  if (!yamlText || !yamlText.trim()) return {};
  const data = yaml.load(yamlText);
  const teamsArr = (data && data.teams) ? data.teams : [];
  const out = {};
  for (const t of teamsArr) {
    out[t.label] = {
      league: "WTV Vereinspokal",
      isPokal: true,
      matches: (t.rounds ?? []).map(r => ({
        date: isoToGerman(r.date),
        time: r.time,
        opponent: r.opponent,
        home: r.home,
        result: r.result ?? null,
      })),
    };
  }
  return out;
}

export function parseTeamMd(md) {
  const { data, content } = matter(md);
  const title = data.title;
  const league = data.league;
  const matches = [];

  const lines = content.split("\n");
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    if (line.startsWith("|---") || line.includes("Datum")) continue;
    const cells = line.split("|").map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length < 4) continue;
    const [date, time, heim, gast] = cells;
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) continue;

    const heimIsUs = HOME_PATTERN.test(heim);
    const gastIsUs = HOME_PATTERN.test(gast);
    if (!heimIsUs && !gastIsUs) continue;

    const resultCell = cells[4];
    matches.push({
      date,
      time,
      opponent: heimIsUs ? gast.replace(/\*\*/g, "").trim() : heim.replace(/\*\*/g, "").trim(),
      home: heimIsUs,
      result: (!resultCell || resultCell === "-") ? null : resultCell,
    });
  }

  return { title, league, matches };
}

export function buildTeamsData() {
  const files = fs.readdirSync(MANNSCHAFTEN_DIR).filter(f => f.endsWith(".md") && f !== "_index.md");
  const teams = {};
  for (const f of files) {
    const md = fs.readFileSync(path.join(MANNSCHAFTEN_DIR, f), "utf8");
    const parsed = parseTeamMd(md);
    const remappedTitle = TITLE_REMAP[parsed.title] ?? parsed.title;
    teams[remappedTitle] = {
      league: parsed.league,
      matches: parsed.matches,
    };
  }
  let pokal;
  try {
    pokal = parsePokalYaml(fs.readFileSync(POKAL_DATA, "utf8"));
    if (Object.keys(pokal).length === 0) pokal = POKAL_FALLBACK;
  } catch {
    console.warn(`⚠ ${POKAL_DATA} not readable — pokal falls back to free-text`);
    pokal = POKAL_FALLBACK;
  }
  Object.assign(teams, pokal);
  return teams;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = buildTeamsData();
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
  console.log(`✓ Wrote ${OUTPUT} (${Object.keys(data).length} teams)`);
}
