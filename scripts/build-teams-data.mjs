import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

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

const POKAL_TEAMS = {
  "Herren-Pokal":     { league: "WTV Vereinspokal", matches: null, isPokal: true },
  "Herren 40-Pokal":  { league: "WTV Vereinspokal", matches: null, isPokal: true },
};

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

    matches.push({
      date,
      time,
      opponent: heimIsUs ? gast.replace(/\*\*/g, "").trim() : heim.replace(/\*\*/g, "").trim(),
      home: heimIsUs,
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
  Object.assign(teams, POKAL_TEAMS);
  return teams;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = buildTeamsData();
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
  console.log(`✓ Wrote ${OUTPUT} (${Object.keys(data).length} teams)`);
}
