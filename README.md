# GeoQuest

A geography game for grades 6–9: countries and capitals, rivers, oceans, seas, gulfs and bays, mountain ranges and ocean currents, on a 3D globe or a flat map. Each player picks one language to play in: Spanish, English or German.

The game ships as one self-contained, offline HTML file: `dist/index.html`.

## Modes
- **Explore** – tap anything to see (and hear) its name
- **Find it** – find a named place on the map
- **Name it** – something lights up, pick its name
- **Capitals** – countries and capitals in both directions

Rivers, seas and currents can be practised as the **class list** (the school worksheets: “Principales ríos del mundo”, “Principales océanos, mares, golfos y bahías”, “Corrientes”) or as everything in the game.

Progress is saved per player in the browser (spaced repetition, a mastery map, stars and badges) and can be exported to a file.

## Development
```sh
npm install
npm run fetch-data   # download Natural Earth layers into raw/
npm run build-data   # build src/data/ from raw/ + content/catalog.mjs
npm run build        # bundle everything into dist/index.html
npm test
```

Curated content (names in all three languages, tiers, continents, class-list flags, hand-drawn current paths) lives in `content/catalog.mjs`.

Map data: [Natural Earth](https://www.naturalearthdata.com/) (public domain).
