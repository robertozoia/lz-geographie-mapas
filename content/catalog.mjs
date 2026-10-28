// Curated game content. Geometry comes from Natural Earth; names for physical
// features are hand-written here so all three languages are consistent.
//
// Continents: af = Africa, eu = Europe, as = Asia, na = North America,
//             sa = South America, oc = Oceania
// Tier: 1 = well known, 2 = intermediate, 3 = advanced
// s: 1 = on the class list (the school worksheets: "Principales ríos del
//        mundo", "Principales océanos, mares, golfos y bahías", "Corrientes")
// Spanish names follow the worksheets.

const n = (en, es, de) => ({ en, es, de });

// ---------------------------------------------------------------- countries
// Quiz countries are derived from Natural Earth (sovereign states); these
// tables adjust the defaults.
export const countries = {
  // NE features merged into another feature (UN view for school use)
  merge: { SOL: 'SOM', CYN: 'CYP' },
  // NE TYPE values that count as countries, plus explicit inclusions/exclusions
  types: ['Sovereign country', 'Country', 'Sovereignty'],
  include: ['KOS', 'ISR', 'PSX'],
  exclude: ['SOL', 'CYN', 'JEY', 'GGY', 'IMN', 'ABW', 'CUW', 'ALD', 'GRL', 'MAC', 'HKG', 'SXM'],
  // Overseas parts shown as their own territory ("part of France") instead of
  // as the country itself (Natural Earth map-unit codes)
  overseas: ['GUF', 'GLP', 'MTQ', 'MYT', 'REU', 'NLY', 'TKL'],
  names: {
    REU: n('Réunion', 'Reunión', 'Réunion'),
    USA: n('United States', 'Estados Unidos', 'Vereinigte Staaten'),
    CHN: n('China', 'China', 'China'),
    TWN: n('Taiwan', 'Taiwán', 'Taiwan'),
    CYP: n('Cyprus', 'Chipre', 'Zypern'),
    FSM: n('Micronesia', 'Micronesia', 'Mikronesien'),
    SWZ: n('Eswatini', 'Esuatini', 'Eswatini'),
    MMR: n('Myanmar', 'Myanmar', 'Myanmar'),
    MDA: n('Moldova', 'Moldavia', 'Moldau'),
    CZE: n('Czechia', 'Chequia', 'Tschechien'),
    GMB: n('Gambia', 'Gambia', 'Gambia'),
    BHS: n('Bahamas', 'Bahamas', 'Bahamas'),
    TLS: n('East Timor', 'Timor Oriental', 'Osttimor'),
  },
  // Continent fixes (NE uses "Seven seas" for some island states)
  continents: {
    SYC: ['af'], MUS: ['af'], MDV: ['as'], REU: ['af'], MYT: ['af'], GUF: ['sa'], RUS: ['eu', 'as'], TUR: ['as', 'eu'],
  },
  // Tier = from NE LABELRANK (<=2 → 1, 3–4 → 2, else 3) unless overridden
  tiers: { NLD: 2, HUN: 2, CZE: 2, CHE: 1, AUT: 2, CUB: 2, ISR: 2, KOS: 3, PSX: 3, TWN: 2 },
  // Preferred capital where NE lists several (matched on NE populated place NAME)
  capitals: {
    TZA: 'Dodoma', BEN: 'Porto-Novo', ZAF: 'Pretoria', CIV: 'Yamoussoukro', BOL: 'Sucre',
    MMR: 'Naypyidaw', LKA: 'Sri Jayawardenepura Kotte', SWZ: 'Mbabane', MYS: 'Kuala Lumpur',
    NLD: 'Amsterdam', PHL: 'Manila', MAR: 'Rabat', JPN: 'Tokyo', NGA: 'Abuja', CHL: 'Santiago',
  },
  // Countries without a capital question (contested status of the capital)
  noCapital: ['ISR', 'PSX'],
  // Populated-places country code where it differs from the countries layer
  capitalA3: { SDS: 'SSD' },
  // Capitals missing from Natural Earth
  capitalManual: { NRU: { n: n('Yaren', 'Yaren', 'Yaren'), ll: [166.92, -0.55] } },
  capitalNames: {
    KAZ: n('Astana', 'Astaná', 'Astana'),
    TKM: n('Ashgabat', 'Asjabad', 'Aschgabat'),
    USA: n('Washington, D.C.', 'Washington D. C.', 'Washington, D.C.'),
    GRD: n("St. George's", "Saint George's", "St. George's"),
    ATG: n("St. John's", "Saint John's", "St. John's"),
  },
};

// ------------------------------------------------------------------- rivers
// match: Natural Earth 10m river segment names; bbox [west, south, east, north]
// limits the match to the right river.
export const rivers = [
  // Africa
  { id: 'nile', s: 1, n: n('Nile', 'Nilo', 'Nil'), c: ['af'], t: 1, match: ['Nile', 'El Bahr el Abyad', 'Bahr el Jebel', 'Albert Nile', 'Victoria Nile', 'Rosetta Branch', 'Damietta Branch'], bbox: [24, -3, 36, 32] },
  { id: 'congo', s: 1, n: n('Congo', 'Congo', 'Kongo'), c: ['af'], t: 1, match: ['Congo', 'Lualaba'], bbox: [11, -12, 30, 5] },
  { id: 'niger', s: 1, n: n('Niger', 'Níger', 'Niger'), c: ['af'], t: 1, match: ['Niger'], bbox: [-12, 3, 10, 18] },
  { id: 'zambezi', s: 1, n: n('Zambezi', 'Zambeze', 'Sambesi'), c: ['af'], t: 2, match: ['Zambezi'], bbox: [21, -19, 37, -10] },
  { id: 'orange', s: 1, n: n('Orange', 'Orange', 'Oranje'), c: ['af'], t: 3, match: ['Orange'], bbox: [15, -32, 30, -27] },
  { id: 'limpopo', s: 1, n: n('Limpopo', 'Limpopo', 'Limpopo'), c: ['af'], t: 3, match: ['Limpopo'], bbox: [25, -26, 34, -21] },
  { id: 'senegal', s: 1, n: n('Senegal', 'Senegal', 'Senegal'), c: ['af'], t: 3, match: ['Sénégal', 'Bafing'], bbox: [-17, 10, -8, 17] },
  // Europe
  { id: 'danube', s: 1, n: n('Danube', 'Danubio', 'Donau'), c: ['eu'], t: 1, match: ['Danube', 'Donau', 'Bratul Chillia', 'Bratul Sulina', 'Bratul Sfintu Gheorghe'], bbox: [8, 42, 30, 50] },
  { id: 'rhine', s: 1, n: n('Rhine', 'Rhin', 'Rhein'), c: ['eu'], t: 1, match: ['Rhine', 'Rhein', 'Rhin', 'Nederrijn', 'Lek'], bbox: [3, 46, 11, 53] },
  { id: 'volga', s: 1, n: n('Volga', 'Volga', 'Wolga'), c: ['eu'], t: 1, match: ['Volga'], bbox: [32, 45, 52, 59] },
  { id: 'dnieper', s: 1, n: n('Dnieper', 'Dnieper', 'Dnepr'), c: ['eu'], t: 2, match: ['Dnipro', 'Dnepre'], bbox: [27, 46, 36, 57] },
  { id: 'elbe', s: 1, n: n('Elbe', 'Elba', 'Elbe'), c: ['eu'], t: 2, match: ['Elbe'], bbox: [8, 49, 16, 54.5] },
  { id: 'seine', n: n('Seine', 'Sena', 'Seine'), c: ['eu'], t: 2, match: ['Seine'], bbox: [-1, 47, 6, 50] },
  { id: 'tagus', s: 1, n: n('Tagus', 'Tajo', 'Tajo'), c: ['eu'], t: 2, match: ['Tajo', 'Tejo'], bbox: [-10, 38, -1, 41.5] },
  { id: 'po', n: n('Po', 'Po', 'Po'), c: ['eu'], t: 2, match: ['Po'], bbox: [6, 44, 13, 46.5] },
  { id: 'thames', n: n('Thames', 'Támesis', 'Themse'), c: ['eu'], t: 2, match: ['Thames'], bbox: [-3, 51, 2, 52.5] },
  { id: 'loire', s: 1, n: n('Loire', 'Loira', 'Loire'), c: ['eu'], t: 2, match: ['Loire'], bbox: [-2.5, 44.5, 5, 48.2] },
  { id: 'duero', s: 1, n: n('Douro', 'Duero', 'Duero'), c: ['eu'], t: 3, match: ['Duero', 'Douro'], bbox: [-9, 40, -2, 42.5] },
  { id: 'don', s: 1, n: n('Don', 'Don', 'Don'), c: ['eu'], t: 2, match: ['Don'], bbox: [37, 46, 46, 54] },
  { id: 'pechora', s: 1, n: n('Pechora', 'Péchora', 'Petschora'), c: ['eu'], t: 3, match: ['Pechora'], bbox: [50, 61, 62, 69] },
  { id: 'ural', s: 1, n: n('Ural', 'Ural', 'Ural'), c: ['eu', 'as'], t: 2, match: ['Ural'], bbox: [50, 46, 60, 55] },
  // Asia
  { id: 'yangtze', s: 1, n: n('Yangtze', 'Yangtse Kiang', 'Jangtse'), c: ['as'], t: 1, match: ['Yangtze', 'Chang Jiang', 'Jinsha', 'Tongtian', 'Tuotuo'], bbox: [89, 24, 123, 36] },
  { id: 'huang', s: 1, n: n('Yellow River (Huang He)', 'Huang-Ho', 'Gelber Fluss (Huang He)'), c: ['as'], t: 1, match: ['Huang'], bbox: [95, 32, 120, 42] },
  { id: 'mekong', s: 1, n: n('Mekong', 'Mekong', 'Mekong'), c: ['as'], t: 2, match: ['Mekong', 'Lancang'], bbox: [93, 8, 108, 34] },
  { id: 'ganges', s: 1, n: n('Ganges', 'Ganges', 'Ganges'), c: ['as'], t: 1, match: ['Ganges'], bbox: [77, 21, 92, 31] },
  { id: 'indus', s: 1, n: n('Indus', 'Indo', 'Indus'), c: ['as'], t: 2, match: ['Indus'], bbox: [66, 23, 82, 37] },
  { id: 'brahmaputra', s: 1, n: n('Brahmaputra', 'Brahmaputra', 'Brahmaputra'), c: ['as'], t: 3, match: ['Brahmaputra', 'Yarlung', 'Dihang'], bbox: [82, 22, 97, 31] },
  { id: 'ob', s: 1, n: n('Ob', 'Obi', 'Ob'), c: ['as'], t: 2, match: ['Ob'], bbox: [64, 50, 90, 68] },
  { id: 'yenisei', s: 1, n: n('Yenisei', 'Yenisei', 'Jenissei'), c: ['as'], t: 2, match: ['Yenisey'], bbox: [80, 50, 100, 73] },
  { id: 'lena', s: 1, n: n('Lena', 'Lena', 'Lena'), c: ['as'], t: 3, match: ['Lena'], bbox: [102, 52, 135, 74] },
  { id: 'amur', s: 1, n: n('Amur', 'Amur', 'Amur'), c: ['as'], t: 3, match: ['Amur'], bbox: [115, 45, 142, 54] },
  { id: 'euphrates', s: 1, n: n('Euphrates', 'Éufrates', 'Euphrat'), c: ['as'], t: 2, match: ['Euphrates', 'Firat', 'Al Furat'], bbox: [36, 29, 48, 40] },
  { id: 'tigris', s: 1, n: n('Tigris', 'Tigris', 'Tigris'), c: ['as'], t: 2, match: ['Tigris', 'Dicle'], bbox: [38, 29, 48, 39] },
  { id: 'salween', s: 1, n: n('Salween', 'Salween', 'Saluen'), c: ['as'], t: 3, match: ['Salween', 'Nu'], bbox: [91, 15, 100, 33] },
  { id: 'syr-darya', s: 1, n: n('Syr Darya', 'Sir-Daria', 'Syrdarja'), c: ['as'], t: 3, match: ['Syr  Darya', 'Syr Darya'], bbox: [60, 39, 75, 47] },
  { id: 'amu-darya', s: 1, n: n('Amu Darya', 'Amu-Daria', 'Amudarja'), c: ['as'], t: 3, match: ['Amu  Darya', 'Amu Darya'], bbox: [58, 36, 72, 44] },
  // North America
  { id: 'mississippi', s: 1, n: n('Mississippi', 'Mississippi', 'Mississippi'), c: ['na'], t: 1, match: ['Mississippi'], bbox: [-96, 28, -88, 48] },
  { id: 'missouri', n: n('Missouri', 'Misuri', 'Missouri'), c: ['na'], t: 2, match: ['Missouri'], bbox: [-114, 38, -89, 49] },
  { id: 'mackenzie', s: 1, n: n('Mackenzie', 'Mackenzie', 'Mackenzie'), c: ['na'], t: 3, match: ['Mackenzie'], bbox: [-140, 60, -110, 70] },
  { id: 'yukon', s: 1, n: n('Yukon', 'Yukón', 'Yukon'), c: ['na'], t: 3, match: ['Yukon'], bbox: [-166, 59, -130, 67] },
  { id: 'st-lawrence', s: 1, n: n('St. Lawrence', 'San Lorenzo', 'Sankt-Lorenz-Strom'), c: ['na'], t: 2, match: ['St. Lawrence'], bbox: [-80, 43, -60, 50], extra: [[[-74.0, 45.3], [-73.5, 45.6], [-72.5, 46.2], [-71.2, 46.8], [-70.0, 47.5], [-68.8, 48.4], [-67.2, 49.1], [-65.8, 49.5]]] },
  { id: 'colorado', s: 1, n: n('Colorado', 'Colorado', 'Colorado'), c: ['na'], t: 2, match: ['Colorado'], bbox: [-118, 31, -104, 41] },
  { id: 'rio-grande', s: 1, n: n('Rio Grande', 'Bravo', 'Rio Grande'), c: ['na'], t: 2, match: ['Rio Grande'], bbox: [-108, 25, -96, 39] },
  { id: 'columbia', n: n('Columbia', 'Columbia', 'Columbia'), c: ['na'], t: 3, match: ['Columbia'], bbox: [-125, 45, -115, 53] },
  { id: 'ohio', n: n('Ohio', 'Ohio', 'Ohio'), c: ['na'], t: 3, match: ['Ohio'], bbox: [-90, 36, -79, 42] },
  { id: 'lerma', s: 1, n: n('Lerma', 'Lerma', 'Lerma'), c: ['na'], t: 2, match: ['Lerma', 'Ro Grande de Santiago'], bbox: [-106, 19, -99, 22] },
  // South America
  { id: 'amazon', s: 1, n: n('Amazon', 'Amazonas', 'Amazonas'), c: ['sa'], t: 1, match: ['Amazonas', 'Ucayali'], bbox: [-78, -12, -48, 2] },
  { id: 'parana', s: 1, n: n('Paraná – Río de la Plata', 'Paraná - Río de la Plata', 'Paraná – Río de la Plata'), c: ['sa'], t: 2, match: ['Paraná'], bbox: [-62, -35, -45, -15], extra: [[[-58.4, -33.9], [-57.6, -34.6], [-56.6, -35.1], [-55.6, -35.4]]] },
  { id: 'orinoco', s: 1, n: n('Orinoco', 'Orinoco', 'Orinoco'), c: ['sa'], t: 2, match: ['Orinoco'], bbox: [-72, 2, -60, 10] },
  { id: 'sao-francisco', s: 1, n: n('São Francisco', 'San Francisco', 'São Francisco'), c: ['sa'], t: 3, match: ['São  Francisco', 'São Francisco'], bbox: [-48, -21, -36, -8] },
  { id: 'magdalena', n: n('Magdalena', 'Magdalena', 'Magdalena'), c: ['sa'], t: 3, match: ['Magdalena'], bbox: [-77, 1, -73, 12] },
  { id: 'madeira', n: n('Madeira', 'Madeira', 'Madeira'), c: ['sa'], t: 3, match: ['Madeira'], bbox: [-66, -12, -58, -3] },
  { id: 'uruguay', n: n('Uruguay', 'Uruguay', 'Uruguay'), c: ['sa'], t: 3, match: ['Uruguay'], bbox: [-60, -35, -49, -26] },
  // Oceania
  { id: 'murray-darling', s: 1, n: n('Murray–Darling', 'Murray-Darling', 'Murray-Darling'), c: ['oc'], t: 2, match: ['Murray', 'Darling', 'Barwon'], bbox: [138, -37, 152, -28] },
  { id: 'waikato', n: n('Waikato', 'Waikato', 'Waikato'), c: ['oc'], t: 3, match: ['Waikato'], bbox: [174, -40, 177, -37] },
];

// --------------------------------------------------------- oceans and seas
// match: Natural Earth marine polygon names (merged into one shape)
// clip: [west, south, east, north] keeps only that part (used to split the
//       Caribbean into Mar Caribe and Mar de las Antillas, as in class)
export const seas = [
  { id: 'atlantic', s: 1, n: n('Atlantic Ocean', 'Océano Atlántico', 'Atlantischer Ozean'), c: ['eu', 'af', 'na', 'sa'], t: 1, kind: 'ocean', match: ['North Atlantic Ocean', 'South Atlantic Ocean', 'Sargasso Sea'] },
  { id: 'pacific', s: 1, n: n('Pacific Ocean', 'Océano Pacífico', 'Pazifischer Ozean'), c: ['as', 'oc', 'na', 'sa'], t: 1, kind: 'ocean', match: ['North Pacific Ocean', 'South Pacific Ocean'] },
  { id: 'indian', s: 1, n: n('Indian Ocean', 'Océano Índico', 'Indischer Ozean'), c: ['af', 'as', 'oc'], t: 1, kind: 'ocean', match: ['INDIAN OCEAN'] },
  { id: 'arctic', s: 1, n: n('Arctic Ocean', 'Océano Glacial Ártico', 'Arktischer Ozean'), c: ['eu', 'as', 'na'], t: 1, kind: 'ocean', match: ['Arctic Ocean'] },
  { id: 'southern', s: 1, n: n('Southern Ocean', 'Océano Glacial Antártico', 'Südlicher Ozean'), c: ['oc', 'sa', 'af'], t: 2, kind: 'ocean', match: ['SOUTHERN OCEAN'] },
  { id: 'mediterranean', s: 1, n: n('Mediterranean Sea', 'Mar Mediterráneo', 'Mittelmeer'), c: ['eu', 'af', 'as'], t: 1, match: ['Mediterranean Sea', 'Tyrrhenian Sea', 'Adriatic Sea', 'Ionian Sea', 'Balearic Sea', 'Aegean Sea', 'Sea of Crete', 'Ligurian Sea', 'Alboran Sea', 'Golfe du Lion', 'Gulf of Gabès', 'Gulf of Sidra'] },
  { id: 'caribbean', s: 1, n: n('Caribbean Sea', 'Mar Caribe', 'Karibisches Meer'), c: ['na', 'sa'], t: 1, match: ['Caribbean Sea'], clip: [-90, 5, -71.5, 25] },
  { id: 'antilles', s: 1, n: n('Antilles Sea', 'Mar de las Antillas', 'Antillenmeer'), c: ['na', 'sa'], t: 2, match: ['Caribbean Sea'], clip: [-71.5, 5, -55, 25] },
  { id: 'gulf-of-mexico', s: 1, n: n('Gulf of Mexico', 'Golfo de México', 'Golf von Mexiko'), c: ['na'], t: 1, match: ['Gulf of Mexico', 'Bahía de Campeche'] },
  { id: 'north-sea', s: 1, n: n('North Sea', 'Mar del Norte', 'Nordsee'), c: ['eu'], t: 1, match: ['North Sea'] },
  { id: 'baltic', s: 1, n: n('Baltic Sea', 'Mar Báltico', 'Ostsee'), c: ['eu'], t: 1, match: ['Baltic Sea', 'Gulf of Bothnia', 'Gulf of Finland', 'Gulf of Riga'] },
  { id: 'black-sea', s: 1, n: n('Black Sea', 'Mar Negro', 'Schwarzes Meer'), c: ['eu', 'as'], t: 1, match: ['Black Sea'] },
  { id: 'red-sea', s: 1, n: n('Red Sea', 'Mar Rojo', 'Rotes Meer'), c: ['af', 'as'], t: 1, match: ['Red Sea'] },
  { id: 'caspian', s: 1, n: n('Caspian Sea', 'Mar Caspio', 'Kaspisches Meer'), c: ['eu', 'as'], t: 1, match: ['Caspian Sea'] },
  { id: 'arabian', s: 1, n: n('Arabian Sea', 'Mar Arábigo', 'Arabisches Meer'), c: ['as'], t: 2, match: ['Arabian Sea'] },
  { id: 'bengal', s: 1, n: n('Bay of Bengal', 'Golfo de Bengala', 'Golf von Bengalen'), c: ['as'], t: 2, match: ['Bay of Bengal'] },
  { id: 'south-china', s: 1, n: n('South China Sea', 'Mar de China Meridional', 'Südchinesisches Meer'), c: ['as'], t: 2, match: ['South China Sea'] },
  { id: 'east-china', n: n('East China Sea', 'Mar de China Oriental', 'Ostchinesisches Meer'), c: ['as'], t: 3, match: ['East China Sea'] },
  { id: 'japan', s: 1, n: n('Sea of Japan', 'Mar de Japón', 'Japanisches Meer'), c: ['as'], t: 2, match: ['Sea of Japan'] },
  { id: 'yellow-sea', s: 1, n: n('Yellow Sea', 'Mar Amarillo', 'Gelbes Meer'), c: ['as'], t: 3, match: ['Yellow Sea'] },
  { id: 'philippine', n: n('Philippine Sea', 'Mar de Filipinas', 'Philippinensee'), c: ['as'], t: 3, match: ['Philippine Sea'] },
  { id: 'coral', s: 1, n: n('Coral Sea', 'Mar del Coral', 'Korallenmeer'), c: ['oc'], t: 2, match: ['Coral Sea'] },
  { id: 'tasman', s: 1, n: n('Tasman Sea', 'Mar de Tasmania', 'Tasmansee'), c: ['oc'], t: 2, match: ['Tasman Sea'] },
  { id: 'great-australian-bight', s: 1, n: n('Great Australian Bight', 'Gran Bahía Australiana', 'Große Australische Bucht'), c: ['oc'], t: 2, match: ['Great Australian Bight'] },
  { id: 'arafura', n: n('Arafura Sea', 'Mar de Arafura', 'Arafurasee'), c: ['oc', 'as'], t: 3, match: ['Arafura Sea'] },
  { id: 'java', s: 1, n: n('Java Sea', 'Mar de Java', 'Javasee'), c: ['as'], t: 3, match: ['Java Sea'] },
  { id: 'bering', s: 1, n: n('Bering Sea', 'Mar de Bering', 'Beringmeer'), c: ['na', 'as'], t: 2, match: ['Bering Sea'] },
  { id: 'okhotsk', s: 1, n: n('Sea of Okhotsk', 'Mar de Ojotsk', 'Ochotskisches Meer'), c: ['as'], t: 3, match: ['Sea of Okhotsk'] },
  { id: 'hudson', s: 1, n: n('Hudson Bay', 'Bahía de Hudson', 'Hudson Bay'), c: ['na'], t: 2, match: ['Hudson Bay'] },
  { id: 'alaska', s: 1, n: n('Gulf of Alaska', 'Golfo de Alaska', 'Golf von Alaska'), c: ['na'], t: 3, match: ['Gulf of Alaska'] },
  { id: 'labrador', n: n('Labrador Sea', 'Mar de Labrador', 'Labradorsee'), c: ['na'], t: 3, match: ['Labrador Sea'] },
  { id: 'beaufort', s: 1, n: n('Beaufort Sea', 'Mar de Beaufort', 'Beaufortsee'), c: ['na'], t: 3, match: ['Beaufort Sea'] },
  { id: 'baffin', s: 1, n: n('Baffin Bay', 'Bahía de Baffin', 'Baffin Bay'), c: ['na'], t: 2, match: ['Baffin Bay'] },
  { id: 'st-lawrence-gulf', s: 1, n: n('Gulf of St. Lawrence', 'Golfo de San Lorenzo', 'Sankt-Lorenz-Golf'), c: ['na'], t: 3, match: ['Gulf of Saint Lawrence'] },
  { id: 'california', s: 1, n: n('Gulf of California', 'Golfo de California', 'Golf von Kalifornien'), c: ['na'], t: 3, match: ['Golfo de California'] },
  { id: 'barents', s: 1, n: n('Barents Sea', 'Mar de Barents', 'Barentssee'), c: ['eu'], t: 2, match: ['Barents Sea'] },
  { id: 'norwegian', s: 1, n: n('Norwegian Sea', 'Mar de Noruega', 'Europäisches Nordmeer'), c: ['eu'], t: 2, match: ['Norwegian Sea'] },
  { id: 'bothnia', s: 1, n: n('Gulf of Bothnia', 'Golfo de Botnia', 'Bottnischer Meerbusen'), c: ['eu'], t: 2, match: ['Gulf of Bothnia'] },
  { id: 'kara', s: 1, n: n('Kara Sea', 'Mar de Kara', 'Karasee'), c: ['as', 'eu'], t: 3, match: ['Kara Sea'] },
  { id: 'laptev', s: 1, n: n('Laptev Sea', 'Mar de Laptev', 'Laptewsee'), c: ['as'], t: 3, match: ['Laptev Sea'] },
  { id: 'east-siberian', s: 1, n: n('East Siberian Sea', 'Mar de Siberia', 'Ostsibirische See'), c: ['as'], t: 3, match: ['East Siberian Sea'] },
  { id: 'aral', s: 1, n: n('Aral Sea', 'Mar de Aral', 'Aralsee'), c: ['as'], t: 2, src: 'lakes', match: ['North Aral Sea', 'South Aral Sea'] },
  { id: 'adriatic', n: n('Adriatic Sea', 'Mar Adriático', 'Adriatisches Meer'), c: ['eu'], t: 2, match: ['Adriatic Sea'] },
  { id: 'aegean', n: n('Aegean Sea', 'Mar Egeo', 'Ägäisches Meer'), c: ['eu'], t: 2, match: ['Aegean Sea'] },
  { id: 'tyrrhenian', n: n('Tyrrhenian Sea', 'Mar Tirreno', 'Tyrrhenisches Meer'), c: ['eu'], t: 3, match: ['Tyrrhenian Sea'] },
  { id: 'biscay', s: 1, n: n('Bay of Biscay', 'Golfo de Vizcaya', 'Golf von Biskaya'), c: ['eu'], t: 3, match: ['Bay of Biscay'] },
  { id: 'english-channel', n: n('English Channel', 'Canal de la Mancha', 'Ärmelkanal'), c: ['eu'], t: 3, match: ['English Channel'] },
  { id: 'persian-gulf', s: 1, n: n('Persian Gulf', 'Golfo Pérsico', 'Persischer Golf'), c: ['as'], t: 2, match: ['Persian Gulf'] },
  { id: 'aden', n: n('Gulf of Aden', 'Golfo de Adén', 'Golf von Aden'), c: ['af', 'as'], t: 3, match: ['Gulf of Aden'] },
  { id: 'guinea', s: 1, n: n('Gulf of Guinea', 'Golfo de Guinea', 'Golf von Guinea'), c: ['af'], t: 2, match: ['Gulf of Guinea'] },
  { id: 'mozambique', n: n('Mozambique Channel', 'Canal de Mozambique', 'Straße von Mosambik'), c: ['af'], t: 3, match: ['Mozambique Channel'] },
  { id: 'sargasso', n: n('Sargasso Sea', 'Mar de los Sargazos', 'Sargassosee'), c: ['na'], t: 3, match: ['Sargasso Sea'] },
  { id: 'weddell', n: n('Weddell Sea', 'Mar de Weddell', 'Weddellmeer'), c: ['sa'], t: 3, match: ['Weddell Sea'] },
  { id: 'ross', n: n('Ross Sea', 'Mar de Ross', 'Rossmeer'), c: ['oc'], t: 3, match: ['Ross Sea'] },
];

// ---------------------------------------------------------- mountain ranges
// match: Natural Earth 10m geography region names (FEATURECLA Range/mtn)
export const ranges = [
  // Europe
  { id: 'alps', n: n('Alps', 'Alpes', 'Alpen'), c: ['eu'], t: 1, match: ['ALPS'] },
  { id: 'pyrenees', n: n('Pyrenees', 'Pirineos', 'Pyrenäen'), c: ['eu'], t: 1, match: ['PYRENEES'] },
  { id: 'carpathians', n: n('Carpathians', 'Cárpatos', 'Karpaten'), c: ['eu'], t: 2, match: ['CARPATHIAN MOUNTAINS'] },
  { id: 'urals', n: n('Ural Mountains', 'Montes Urales', 'Ural'), c: ['eu', 'as'], t: 1, match: ['URAL MOUNTAINS'] },
  { id: 'caucasus', n: n('Caucasus', 'Cáucaso', 'Kaukasus'), c: ['eu', 'as'], t: 2, match: ['CAUCASUS MTS.'] },
  { id: 'scandinavian', n: n('Scandinavian Mountains', 'Alpes Escandinavos', 'Skandinavisches Gebirge'), c: ['eu'], t: 2, match: ['KJØLEN MOUNTAINS'] },
  { id: 'apennines', n: n('Apennines', 'Apeninos', 'Apennin'), c: ['eu'], t: 2, match: ['APPENNINI'] },
  { id: 'balkan', n: n('Balkan Mountains', 'Montes Balcanes', 'Balkangebirge'), c: ['eu'], t: 3, match: ['Balkan Mts.'] },
  // Asia
  { id: 'himalayas', n: n('Himalayas', 'Himalaya', 'Himalaya'), c: ['as'], t: 1, match: ['HIMALAYAS'] },
  { id: 'karakoram', n: n('Karakoram', 'Karakórum', 'Karakorum'), c: ['as'], t: 3, match: ['KARAKORAM RA.'] },
  { id: 'hindu-kush', n: n('Hindu Kush', 'Hindú Kush', 'Hindukusch'), c: ['as'], t: 2, match: ['HINDU KUSH'] },
  { id: 'tian-shan', n: n('Tian Shan', 'Tian Shan', 'Tian Shan'), c: ['as'], t: 2, match: ['TIAN SHAN'] },
  { id: 'pamir', n: n('Pamir Mountains', 'Pamir', 'Pamir'), c: ['as'], t: 3, match: ['PAMIRS'] },
  { id: 'altai', n: n('Altai Mountains', 'Montes Altái', 'Altai'), c: ['as'], t: 2, match: ['ALTAY MOUNTAINS'] },
  { id: 'kunlun', n: n('Kunlun Mountains', 'Montes Kunlun', 'Kunlun'), c: ['as'], t: 3, match: ['KUNLUN MOUNTAINS'] },
  { id: 'zagros', n: n('Zagros Mountains', 'Montes Zagros', 'Zagros'), c: ['as'], t: 2, match: ['ZAGROS MOUNTAINS'] },
  { id: 'elburz', n: n('Alborz', 'Montes Elburz', 'Elburs'), c: ['as'], t: 3, match: ['ELBURZ MTS.'] },
  { id: 'western-ghats', n: n('Western Ghats', 'Ghats Occidentales', 'Westghats'), c: ['as'], t: 3, match: ['WESTERN GHATS'] },
  { id: 'annamite', n: n('Annamite Range', 'Cordillera Annamita', 'Annamitisches Gebirge'), c: ['as'], t: 3, match: ['CHAÎNE ANNAMITIQUE'] },
  // Africa
  { id: 'atlas', n: n('Atlas Mountains', 'Montes Atlas', 'Atlasgebirge'), c: ['af'], t: 1, match: ['ATLAS MOUNTAINS', 'HAUT ATLAS', 'ATLAS SAHARIEN'] },
  { id: 'drakensberg', n: n('Drakensberg', 'Drakensberg', 'Drakensberge'), c: ['af'], t: 2, match: ['DRAKENSBERG'] },
  { id: 'ethiopian', n: n('Ethiopian Highlands', 'Macizo Etíope', 'Äthiopisches Hochland'), c: ['af'], t: 2, match: ['ETHIOPIAN HIGHLANDS'] },
  { id: 'ahaggar', n: n('Ahaggar Mountains', 'Macizo de Ahaggar', 'Ahaggar'), c: ['af'], t: 3, match: ['AHAGGAR MTS.'] },
  { id: 'tibesti', n: n('Tibesti Mountains', 'Macizo del Tibesti', 'Tibesti'), c: ['af'], t: 3, match: ['TIBESTI MTS.'] },
  // North America
  { id: 'rockies', n: n('Rocky Mountains', 'Montañas Rocosas', 'Rocky Mountains'), c: ['na'], t: 1, match: ['ROCKY MOUNTAINS'] },
  { id: 'appalachians', n: n('Appalachian Mountains', 'Montes Apalaches', 'Appalachen'), c: ['na'], t: 1, match: ['APPALACHIAN MTS.'] },
  { id: 'sierra-madre-occidental', n: n('Sierra Madre Occidental', 'Sierra Madre Occidental', 'Sierra Madre Occidental'), c: ['na'], t: 2, match: ['SIERRA MADRE OCCIDENTAL'] },
  { id: 'sierra-madre-oriental', n: n('Sierra Madre Oriental', 'Sierra Madre Oriental', 'Sierra Madre Oriental'), c: ['na'], t: 2, match: ['SIERRA MADRE ORIENTAL'] },
  { id: 'sierra-nevada', n: n('Sierra Nevada', 'Sierra Nevada', 'Sierra Nevada'), c: ['na'], t: 3, match: ['SIERRA NEVADA'] },
  { id: 'cascade', n: n('Cascade Range', 'Cordillera de las Cascadas', 'Kaskadenkette'), c: ['na'], t: 3, match: ['CASCADE RANGE'] },
  { id: 'alaska-range', n: n('Alaska Range', 'Cordillera de Alaska', 'Alaskakette'), c: ['na'], t: 2, match: ['ALASKA RANGE'] },
  { id: 'brooks', n: n('Brooks Range', 'Cordillera Brooks', 'Brookskette'), c: ['na'], t: 3, match: ['BROOKS RANGE'] },
  // South America
  { id: 'andes', n: n('Andes', 'Cordillera de los Andes', 'Anden'), c: ['sa'], t: 1, match: ['ANDES'] },
  { id: 'guiana', n: n('Guiana Highlands', 'Macizo de las Guayanas', 'Bergland von Guayana'), c: ['sa'], t: 3, match: ['GUIANA HIGHLANDS'] },
  { id: 'serra-do-mar', n: n('Serra do Mar', 'Sierra del Mar', 'Serra do Mar'), c: ['sa'], t: 3, match: ['Serra do Mar'] },
  // Oceania
  { id: 'great-dividing', n: n('Great Dividing Range', 'Gran Cordillera Divisoria', 'Great Dividing Range'), c: ['oc'], t: 1, match: ['GREAT DIVIDING RANGE'] },
  { id: 'southern-alps', n: n('Southern Alps', 'Alpes del Sur', 'Neuseeländische Alpen'), c: ['oc'], t: 2, match: ['SOUTHERN ALPS'] },
  { id: 'new-guinea', n: n('New Guinea Highlands', 'Cordillera Central de Nueva Guinea', 'Zentralgebirge Neuguineas'), c: ['oc'], t: 3, match: ['NEW GUINEA HIGHLANDS'] },
];

// ----------------------------------------------------------- ocean currents
// No Natural Earth layer exists, so paths are drawn by hand as schematic
// lines in the direction of flow ([lon, lat] waypoints, like a school map).
// kind: 'warm' (cálida) or 'cold' (fría)
export const currents = [
  // warm
  { id: 'gulf-stream', s: 1, kind: 'warm', n: n('Gulf Stream', 'Corriente del Golfo', 'Golfstrom'), c: ['na', 'eu'], t: 1,
    path: [[-81, 24.5], [-80, 27.5], [-79.3, 31], [-75.5, 35], [-70, 38.5], [-60, 40.8], [-50, 42.2], [-42, 44]] },
  { id: 'north-atlantic', s: 1, kind: 'warm', n: n('North Atlantic Current', 'Corriente del Atlántico Norte', 'Nordatlantikstrom'), c: ['eu'], t: 2,
    path: [[-40, 45.5], [-32, 49], [-22, 53], [-13, 57.5], [-5, 61.5], [3, 64.5], [10, 67.5], [17, 71]] },
  { id: 'n-equatorial-atlantic', s: 1, kind: 'warm', n: n('North Equatorial Current (Atlantic)', 'Corriente Ecuatorial del Norte (Atlántico)', 'Nordäquatorialstrom (Atlantik)'), c: ['af', 'na'], t: 2,
    path: [[-19, 15], [-30, 14], [-42, 13.5], [-53, 13.5], [-61, 14.5], [-70, 15.5], [-79, 17], [-85, 20.5]] },
  { id: 's-equatorial-atlantic', s: 1, kind: 'warm', n: n('South Equatorial Current (Atlantic)', 'Corriente Ecuatorial del Sur (Atlántico)', 'Südäquatorialstrom (Atlantik)'), c: ['af', 'sa'], t: 2,
    path: [[8, -2], [-2, -3], [-12, -4], [-22, -5], [-31, -6]] },
  { id: 'brazil', s: 1, kind: 'warm', n: n('Brazil Current', 'Corriente de Brasil', 'Brasilstrom'), c: ['sa'], t: 2,
    path: [[-33.5, -9], [-35.5, -14], [-37.5, -19], [-40, -23], [-45, -27], [-50, -32.5], [-54, -37.5]] },
  { id: 'kuroshio', s: 1, kind: 'warm', n: n('Kuroshio Current', 'Corriente de Kuroshio', 'Kuroshio'), c: ['as'], t: 1,
    path: [[122.5, 19], [123, 23.5], [126.5, 27.5], [131, 30.5], [136, 33], [141, 35.3], [148, 37], [158, 38.5]] },
  { id: 'n-equatorial-pacific', s: 1, kind: 'warm', n: n('North Equatorial Current (Pacific)', 'Corriente Ecuatorial del Norte (Pacífico)', 'Nordäquatorialstrom (Pazifik)'), c: ['na', 'as', 'oc'], t: 2,
    path: [[-112, 13], [-130, 13], [-150, 13], [-170, 13], [170, 13.5], [150, 14], [130, 15]] },
  { id: 's-equatorial-pacific', s: 1, kind: 'warm', n: n('South Equatorial Current (Pacific)', 'Corriente Ecuatorial del Sur (Pacífico)', 'Südäquatorialstrom (Pazifik)'), c: ['sa', 'oc'], t: 2,
    path: [[-84, -3], [-100, -4], [-120, -5.5], [-140, -7], [-160, -9], [-180, -11], [165, -13]] },
  { id: 'equatorial-counter', s: 1, kind: 'warm', n: n('Equatorial Counter Current', 'Contracorriente Ecuatorial', 'Äquatorialer Gegenstrom'), c: ['as', 'oc', 'na', 'sa'], t: 3,
    path: [[132, 6], [150, 6.5], [170, 6.5], [-170, 6.5], [-150, 6.5], [-125, 7], [-95, 7]] },
  { id: 'east-australian', s: 1, kind: 'warm', n: n('East Australian Current', 'Corriente de Australia Oriental', 'Ostaustralstrom'), c: ['oc'], t: 2,
    path: [[156, -15], [155, -20], [154.5, -25.5], [154, -30], [152.5, -34], [151.5, -37.5], [154, -40]] },
  { id: 'mozambique', s: 1, kind: 'warm', n: n('Mozambique Current', 'Corriente de Mozambique', 'Mosambikstrom'), c: ['af'], t: 2,
    path: [[43.5, -11], [41.5, -15.5], [39, -20], [36.5, -24], [34, -28]] },
  { id: 'agulhas', kind: 'warm', n: n('Agulhas Current', 'Corriente de las Agujas', 'Agulhasstrom'), c: ['af'], t: 3,
    path: [[33, -28.5], [30.5, -31.5], [27, -34.5], [22, -37]] },
  // cold
  { id: 'california', s: 1, kind: 'cold', n: n('California Current', 'Corriente de California', 'Kalifornienstrom'), c: ['na'], t: 1,
    path: [[-131, 48], [-127.5, 42], [-123.5, 36], [-119.5, 31], [-116, 25.5], [-112, 21]] },
  { id: 'labrador', s: 1, kind: 'cold', n: n('Labrador Current', 'Corriente del Labrador', 'Labradorstrom'), c: ['na'], t: 1,
    path: [[-62, 67], [-60, 62.5], [-57, 57.5], [-54, 53], [-51.5, 48.5], [-51, 45], [-54, 42.5]] },
  { id: 'east-greenland', s: 1, kind: 'cold', n: n('East Greenland Current', 'Corriente de Groenlandia', 'Ostgrönlandstrom'), c: ['na', 'eu'], t: 2,
    path: [[-8, 79], [-14, 75], [-20, 71], [-27, 67], [-35, 64], [-42, 60]] },
  { id: 'canary', s: 1, kind: 'cold', n: n('Canary Current', 'Corriente de Canarias', 'Kanarenstrom'), c: ['af', 'eu'], t: 1,
    path: [[-15, 41], [-14, 36], [-15.5, 31], [-18, 26], [-20, 21], [-22, 16.5]] },
  { id: 'humboldt', s: 1, kind: 'cold', n: n('Humboldt (Peru) Current', 'Corriente Peruana (de Humboldt)', 'Humboldtstrom'), c: ['sa'], t: 1,
    path: [[-79, -48], [-77, -40], [-75, -32], [-74, -24], [-74.5, -17], [-80, -10], [-83, -5]] },
  { id: 'benguela', s: 1, kind: 'cold', n: n('Benguela Current', 'Corriente de Benguela', 'Benguelastrom'), c: ['af'], t: 2,
    path: [[17, -35.5], [14.5, -30], [12.5, -24], [11, -18], [9.5, -12], [8, -6]] },
  { id: 'oyashio', s: 1, kind: 'cold', n: n('Oyashio Current', 'Corriente de Oyashio', 'Oyashio'), c: ['as'], t: 2,
    path: [[164, 57], [160, 52], [154, 47.5], [148, 43.5], [145, 40.5]] },
  { id: 'antarctic', s: 1, kind: 'cold', n: n('Antarctic Circumpolar Current', 'Corriente Circumpolar Antártica', 'Antarktischer Zirkumpolarstrom'), c: ['sa', 'af', 'oc'], t: 1,
    path: [[-170, -60], [-140, -61], [-110, -60], [-85, -59], [-65, -58.5], [-45, -55], [-20, -51], [5, -49], [30, -48], [55, -48], [80, -48.5], [105, -50.5], [130, -53], [155, -56], [180, -59]] },
  { id: 'west-australian', s: 1, kind: 'cold', n: n('West Australian Current', 'Corriente Australiana Occidental', 'Westaustralstrom'), c: ['oc'], t: 3,
    path: [[80, -38], [95, -37.5], [107, -36], [112.5, -32.5], [113, -27], [112, -22]] },
];

// ---------------------------------------------------------- fishing grounds
// The yellow "zonas pesqueras" of the currents worksheet, drawn by hand as
// rough outlines. currents: the currents that feed them (shown in Explore).
export const fishing = [
  { id: 'pacific-ne', s: 1, n: n('Northeast Pacific (Alaska and Canada)', 'Pacífico Nororiental (Alaska y Canadá)', 'Nordostpazifik (Alaska und Kanada)'), c: ['na'], t: 2, currents: ['california'],
    area: [[-153, 58.5], [-147, 60.8], [-140, 60.5], [-134, 58.5], [-129, 54.5], [-125.5, 50], [-123.5, 46], [-126.5, 45], [-130, 48.5], [-136, 53.5], [-146, 56.5]] },
  { id: 'atlantic-ne', s: 1, n: n('Northeast Atlantic (Western Europe)', 'Atlántico Nororiental (Europa Occidental)', 'Nordostatlantik (Westeuropa)'), c: ['eu'], t: 2, currents: ['north-atlantic', 'canary'],
    area: [[-12, 36], [-12.5, 44], [-9.5, 48.5], [-4.5, 49.8], [0, 48.5], [-0.5, 44.5], [-2, 43.2], [-7, 42.5], [-8, 38.5], [-7, 36.3]] },
  { id: 'pacific-nw', s: 1, n: n('Northwest Pacific (Japan)', 'Pacífico Noroccidental (Japón)', 'Nordwestpazifik (Japan)'), c: ['as'], t: 1, currents: ['kuroshio', 'oyashio'],
    area: [[128.5, 33], [130.5, 37.5], [135, 41], [139.5, 45.8], [146, 46], [146.5, 41.5], [142.5, 36.5], [138.5, 33], [132.5, 30.5]] },
  { id: 'china-seas', s: 1, n: n('China Seas and Southeast Asia', 'Mares de China y Sudeste Asiático', 'Chinesische Meere und Südostasien'), c: ['as'], t: 2, currents: ['kuroshio'],
    area: [[118.5, 39.5], [124, 38.5], [127, 34], [124.5, 28], [122.5, 23], [121, 17], [120, 10.5], [116, 5.5], [110, 3], [104, 7], [107.5, 13.5], [109.5, 20], [113.5, 22.5], [119.5, 26.5], [121.5, 31], [119.5, 35]] },
  { id: 'pacific-se', s: 1, n: n('Southeast Pacific (Peru and Chile)', 'Pacífico Sudoriental (Perú y Chile)', 'Südostpazifik (Peru und Chile)'), c: ['sa'], t: 1, currents: ['humboldt'],
    area: [[-82.5, -3], [-81, -8.5], [-77, -14], [-72, -18], [-71, -25], [-72, -32], [-73.8, -38], [-77.5, -38], [-77.5, -30], [-77.5, -21], [-81.5, -14], [-84.5, -6]] },
  { id: 'atlantic-ec', s: 1, n: n('Eastern Central Atlantic (Gulf of Guinea)', 'Atlántico Centro-Oriental (Golfo de Guinea)', 'Östlicher Zentralatlantik (Golf von Guinea)'), c: ['af'], t: 2, currents: [],
    area: [[-6, 4.8], [0, 5.5], [5.5, 4.5], [9.8, 4], [9.8, 0], [6, -1.5], [0, 0.5], [-6, 2.5]] },
  { id: 'atlantic-se', s: 1, n: n('Southeast Atlantic (Namibia and South Africa)', 'Atlántico Sudoriental (Namibia y Sudáfrica)', 'Südostatlantik (Namibia und Südafrika)'), c: ['af'], t: 2, currents: ['benguela'],
    area: [[11.5, -16.5], [14, -22], [15.5, -27], [18, -31.5], [20, -34.8], [17, -36], [13, -31], [10.5, -25], [9, -18]] },
];
