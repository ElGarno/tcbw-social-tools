import { MatchResult } from "./templates/MatchResult.jsx";
import { MatchAnnouncement } from "./templates/MatchAnnouncement.jsx";
import { SeasonSchedule } from "./templates/SeasonSchedule.jsx";
import { EventCard } from "./templates/EventCard.jsx";

export const TEMPLATES = {
  "match-result": {
    label: "Ergebnis",
    sublabel: "Spiel-Ergebnis nach Heimspiel",
    formats: ["square", "story"],
    variants: [
      { id: "win",   label: "Sieg",       accent: "blue" },
      { id: "loss",  label: "Niederlage", accent: "gray" },
      { id: "pokal", label: "Pokal",      accent: "orange" },
    ],
    Component: MatchResult,
    defaults: {
      team: "Herren 30",
      home: 6, away: 3,
      opponent: "Olper TC",
      date: "09.05.2026",
      location: "Heimspiel",
      league: "Kreisliga",
    },
  },
  "match-announcement": {
    label: "Heimspiel",
    sublabel: "Ankündigung vor dem Match",
    formats: ["square", "portrait", "story"],
    variants: [
      { id: "league", label: "Liga",  accent: "blue" },
      { id: "pokal",  label: "Pokal", accent: "orange" },
    ],
    Component: MatchAnnouncement,
    defaults: {
      team: "Herren 40",
      opponent: "Tennisclub Iserlohn",
      dateLine1: "30. Mai",
      dateLine2: "13:00 Uhr",
      league: "Südwestfalenliga",
      location: "Tennisanlage Burg Schnellenberg",
      cta: "Komm vorbei",
      eyebrow: "Nächstes Heimspiel",
    },
  },
  "season-schedule": {
    label: "Saison",
    sublabel: "Mannschafts-Übersicht",
    formats: ["portrait", "story"],
    variants: [{ id: "default", label: "Standard", accent: "blue" }],
    Component: SeasonSchedule,
    defaults: {
      eyebrow: "Saison 2026",
      title: "Unsere Mannschaften",
      subtitle: "Sommer 2026",
      slogan: "Der an der Burg",
    },
  },
  "event-card": {
    label: "Event",
    sublabel: "Sommerfest, JHV, Arbeitseinsatz …",
    formats: ["square", "portrait", "story"],
    variants: [{ id: "default", label: "Standard", accent: "green" }],
    Component: EventCard,
    defaults: {
      eyebrow: "Vereinsevent",
      title: "Sommerfest 2026",
      dateLine1: "23. August",
      dateLine2: "15:00 Uhr",
      subline: "Familienprogramm · Schleifchenturnier · Grill",
      location: "Tennisanlage Burg Schnellenberg",
      cta: "Wir freuen uns auf euch",
    },
  },
};

export const FORMAT_DIMS = {
  square:   { w: 1080, h: 1080, label: "Square 1:1" },
  portrait: { w: 1080, h: 1350, label: "Portrait 4:5" },
  story:    { w: 1080, h: 1920, label: "Story 9:16" },
};
