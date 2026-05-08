# tcbw-social-tools

Internes Werkzeug für TC Blau-Weiss Attendorn: erzeugt Instagram-fertige Grafiken (Match-Ergebnis, Heimspiel-Ankündigung, Saison-Übersicht, Event) per Form-Eingabe.

**Zugriff:** https://social.tc-bw-attendorn.de (geschützt durch Cloudflare Access — Email-Whitelist).

## Lokale Entwicklung

```bash
git clone git@github.com:ElGarno/tcbw-social-tools.git
cd tcbw-social-tools
npm install
npm run dev
```

Voraussetzung: das Schwester-Repo `tcbw-homepage` muss parallel ausgecheckt sein (`../tcbw-homepage/`), weil das Build-Script die Mannschaftsdaten von dort liest.

## Build

```bash
npm run build
```

Erzeugt `dist/`. Der `prebuild`-Hook regeneriert `src/data/teams.json` aus `../tcbw-homepage/content/mannschaften/*.md`.

## Tests

```bash
npm test
```

## Deployment

Cloudflare Pages baut automatisch bei jedem Push auf `main`.

- **Build-Command:** `bash .cloudflare/build.sh`
- **Output:** `dist`
- **Cross-Repo:** Cloudflare Pages-Build muss `tcbw-homepage` parallel auschecken (siehe `.cloudflare/build.sh`).
