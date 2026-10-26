# GeoQuest

A geography game for grades 6–9: countries and capitals, rivers, oceans and seas, and mountain ranges, on a 3D globe or a flat map. Each player picks one language to play in: Spanish, English or German.

The game ships as one self-contained, offline HTML file: `dist/index.html`.

## Modes
- **Explore** – tap anything to see (and hear) its name
- **Find it** – find a named place on the map
- **Name it** – something lights up, pick its name
- **Capitals** – countries and capitals in both directions

Progress is saved per player in the browser (spaced repetition, a mastery map, stars and badges) and can be exported to a file.

## Development
```sh
npm install
npm run fetch-data   # download Natural Earth layers into raw/
npm run build-data   # build src/data/ from raw/ + content/catalog.mjs
npm run build        # bundle everything into dist/index.html
npm test
```

Curated content (names in all three languages, tiers, continents) lives in `content/catalog.mjs`.

Map data: [Natural Earth](https://www.naturalearthdata.com/) (public domain).
