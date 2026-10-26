// Curated game content. Geometry comes from Natural Earth; names for physical
// features are hand-written here so all three languages are consistent.
//
// Continents: af = Africa, eu = Europe, as = Asia, na = North America,
//             sa = South America, oc = Oceania
// Tier: 1 = well known, 2 = intermediate, 3 = advanced

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
  names: {
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
    SYC: ['af'], MUS: ['af'], MDV: ['as'], RUS: ['eu', 'as'], TUR: ['as', 'eu'],
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
  { id: 'nile', n: n('Nile', 'Nilo', 'Nil'), c: ['af'], t: 1, match: ['Nile', 'El Bahr el Abyad', 'Bahr el Jebel', 'Albert Nile', 'Victoria Nile', 'Rosetta Branch', 'Damietta Branch'], bbox: [24, -3, 36, 32] },
  { id: 'congo', n: n('Congo', 'Congo', 'Kongo'), c: ['af'], t: 1, match: ['Congo', 'Lualaba'], bbox: [11, -12, 30, 5] },
  { id: 'niger', n: n('Niger', 'Níger', 'Niger'), c: ['af'], t: 1, match: ['Niger'], bbox: [-12, 3, 10, 18] },
  { id: 'zambezi', n: n('Zambezi', 'Zambeze', 'Sambesi'), c: ['af'], t: 2, match: ['Zambezi'], bbox: [21, -19, 37, -10] },
  { id: 'orange', n: n('Orange', 'Orange', 'Oranje'), c: ['af'], t: 3, match: ['Orange'], bbox: [15, -32, 30, -27] },
  { id: 'limpopo', n: n('Limpopo', 'Limpopo', 'Limpopo'), c: ['af'], t: 3, match: ['Limpopo'], bbox: [25, -26, 34, -21] },
  { id: 'senegal', n: n('Senegal', 'Senegal', 'Senegal'), c: ['af'], t: 3, match: ['Sénégal', 'Bafing'], bbox: [-17, 10, -8, 17] },
  // Europe
  { id: 'danube', n: n('Danube', 'Danubio', 'Donau'), c: ['eu'], t: 1, match: ['Danube', 'Donau', 'Bratul Chillia', 'Bratul Sulina', 'Bratul Sfintu Gheorghe'], bbox: [8, 42, 30, 50] },
  { id: 'rhine', n: n('Rhine', 'Rin', 'Rhein'), c: ['eu'], t: 1, match: ['Rhine', 'Rhein', 'Rhin', 'Nederrijn', 'Lek'], bbox: [3, 46, 11, 53] },
  { id: 'volga', n: n('Volga', 'Volga', 'Wolga'), c: ['eu'], t: 1, match: ['Volga'], bbox: [32, 45, 52, 59] },
  { id: 'dnieper', n: n('Dnieper', 'Dniéper', 'Dnepr'), c: ['eu'], t: 2, match: ['Dnipro', 'Dnepre'], bbox: [27, 46, 36, 57] },
  { id: 'elbe', n: n('Elbe', 'Elba', 'Elbe'), c: ['eu'], t: 2, match: ['Elbe'], bbox: [8, 49, 16, 54.5] },
  { id: 'seine', n: n('Seine', 'Sena', 'Seine'), c: ['eu'], t: 2, match: ['Seine'], bbox: [-1, 47, 6, 50] },
  { id: 'tagus', n: n('Tagus', 'Tajo', 'Tajo'), c: ['eu'], t: 2, match: ['Tajo', 'Tejo'], bbox: [-10, 38, -1, 41.5] },
  { id: 'po', n: n('Po', 'Po', 'Po'), c: ['eu'], t: 2, match: ['Po'], bbox: [6, 44, 13, 46.5] },
  { id: 'thames', n: n('Thames', 'Támesis', 'Themse'), c: ['eu'], t: 2, match: ['Thames'], bbox: [-3, 51, 2, 52.5] },
  // Asia
  { id: 'yangtze', n: n('Yangtze', 'Yangtsé', 'Jangtse'), c: ['as'], t: 1, match: ['Yangtze', 'Chang Jiang', 'Jinsha', 'Tongtian', 'Tuotuo'], bbox: [89, 24, 123, 36] },
  { id: 'huang', n: n('Yellow River', 'Río Amarillo', 'Gelber Fluss'), c: ['as'], t: 1, match: ['Huang'], bbox: [95, 32, 120, 42] },
  { id: 'mekong', n: n('Mekong', 'Mekong', 'Mekong'), c: ['as'], t: 2, match: ['Mekong', 'Lancang'], bbox: [93, 8, 108, 34] },
  { id: 'ganges', n: n('Ganges', 'Ganges', 'Ganges'), c: ['as'], t: 1, match: ['Ganges'], bbox: [77, 21, 92, 31] },
  { id: 'indus', n: n('Indus', 'Indo', 'Indus'), c: ['as'], t: 2, match: ['Indus'], bbox: [66, 23, 82, 37] },
  { id: 'brahmaputra', n: n('Brahmaputra', 'Brahmaputra', 'Brahmaputra'), c: ['as'], t: 3, match: ['Brahmaputra', 'Yarlung', 'Dihang'], bbox: [82, 22, 97, 31] },
  { id: 'ob', n: n('Ob', 'Obi', 'Ob'), c: ['as'], t: 2, match: ['Ob'], bbox: [64, 50, 90, 68] },
  { id: 'yenisei', n: n('Yenisei', 'Yeniséi', 'Jenissei'), c: ['as'], t: 2, match: ['Yenisey'], bbox: [80, 50, 100, 73] },
  { id: 'lena', n: n('Lena', 'Lena', 'Lena'), c: ['as'], t: 3, match: ['Lena'], bbox: [102, 52, 135, 74] },
  { id: 'amur', n: n('Amur', 'Amur', 'Amur'), c: ['as'], t: 3, match: ['Amur'], bbox: [115, 45, 142, 54] },
  { id: 'euphrates', n: n('Euphrates', 'Éufrates', 'Euphrat'), c: ['as'], t: 2, match: ['Euphrates', 'Firat', 'Al Furat'], bbox: [36, 29, 48, 40] },
  { id: 'tigris', n: n('Tigris', 'Tigris', 'Tigris'), c: ['as'], t: 2, match: ['Tigris', 'Dicle'], bbox: [38, 29, 48, 39] },
  // North America
  { id: 'mississippi', n: n('Mississippi', 'Misisipi', 'Mississippi'), c: ['na'], t: 1, match: ['Mississippi'], bbox: [-96, 28, -88, 48] },
  { id: 'missouri', n: n('Missouri', 'Misuri', 'Missouri'), c: ['na'], t: 2, match: ['Missouri'], bbox: [-114, 38, -89, 49] },
  { id: 'mackenzie', n: n('Mackenzie', 'Mackenzie', 'Mackenzie'), c: ['na'], t: 3, match: ['Mackenzie'], bbox: [-140, 60, -110, 70] },
  { id: 'yukon', n: n('Yukon', 'Yukón', 'Yukon'), c: ['na'], t: 3, match: ['Yukon'], bbox: [-166, 59, -130, 67] },
  { id: 'st-lawrence', n: n('St. Lawrence', 'San Lorenzo', 'Sankt-Lorenz-Strom'), c: ['na'], t: 2, match: ['St. Lawrence'], bbox: [-80, 43, -60, 50] },
  { id: 'colorado', n: n('Colorado', 'Colorado', 'Colorado'), c: ['na'], t: 2, match: ['Colorado'], bbox: [-118, 31, -104, 41] },
  { id: 'rio-grande', n: n('Rio Grande', 'Río Bravo', 'Rio Grande'), c: ['na'], t: 2, match: ['Rio Grande'], bbox: [-108, 25, -96, 39] },
  { id: 'columbia', n: n('Columbia', 'Columbia', 'Columbia'), c: ['na'], t: 3, match: ['Columbia'], bbox: [-125, 45, -115, 53] },
  { id: 'ohio', n: n('Ohio', 'Ohio', 'Ohio'), c: ['na'], t: 3, match: ['Ohio'], bbox: [-90, 36, -79, 42] },
  // South America
  { id: 'amazon', n: n('Amazon', 'Amazonas', 'Amazonas'), c: ['sa'], t: 1, match: ['Amazonas', 'Ucayali'], bbox: [-78, -12, -48, 2] },
  { id: 'parana', n: n('Paraná', 'Paraná', 'Paraná'), c: ['sa'], t: 2, match: ['Paraná'], bbox: [-62, -35, -45, -15] },
  { id: 'orinoco', n: n('Orinoco', 'Orinoco', 'Orinoco'), c: ['sa'], t: 2, match: ['Orinoco'], bbox: [-72, 2, -60, 10] },
  { id: 'sao-francisco', n: n('São Francisco', 'San Francisco', 'São Francisco'), c: ['sa'], t: 3, match: ['São  Francisco', 'São Francisco'], bbox: [-48, -21, -36, -8] },
  { id: 'magdalena', n: n('Magdalena', 'Magdalena', 'Magdalena'), c: ['sa'], t: 3, match: ['Magdalena'], bbox: [-77, 1, -73, 12] },
  { id: 'madeira', n: n('Madeira', 'Madeira', 'Madeira'), c: ['sa'], t: 3, match: ['Madeira'], bbox: [-66, -12, -58, -3] },
  { id: 'uruguay', n: n('Uruguay', 'Uruguay', 'Uruguay'), c: ['sa'], t: 3, match: ['Uruguay'], bbox: [-60, -35, -49, -26] },
  // Oceania
  { id: 'murray', n: n('Murray', 'Murray', 'Murray'), c: ['oc'], t: 2, match: ['Murray'], bbox: [138, -37, 149, -33] },
  { id: 'darling', n: n('Darling', 'Darling', 'Darling'), c: ['oc'], t: 3, match: ['Darling', 'Barwon'], bbox: [141, -35, 152, -28] },
  { id: 'waikato', n: n('Waikato', 'Waikato', 'Waikato'), c: ['oc'], t: 3, match: ['Waikato'], bbox: [174, -40, 177, -37] },
];

// --------------------------------------------------------- oceans and seas
// match: Natural Earth marine polygon names (merged into one shape)
export const seas = [
  { id: 'atlantic', n: n('Atlantic Ocean', 'Océano Atlántico', 'Atlantischer Ozean'), c: ['eu', 'af', 'na', 'sa'], t: 1, kind: 'ocean', match: ['North Atlantic Ocean', 'South Atlantic Ocean', 'Sargasso Sea'] },
  { id: 'pacific', n: n('Pacific Ocean', 'Océano Pacífico', 'Pazifischer Ozean'), c: ['as', 'oc', 'na', 'sa'], t: 1, kind: 'ocean', match: ['North Pacific Ocean', 'South Pacific Ocean'] },
  { id: 'indian', n: n('Indian Ocean', 'Océano Índico', 'Indischer Ozean'), c: ['af', 'as', 'oc'], t: 1, kind: 'ocean', match: ['INDIAN OCEAN'] },
  { id: 'arctic', n: n('Arctic Ocean', 'Océano Glacial Ártico', 'Arktischer Ozean'), c: ['eu', 'as', 'na'], t: 1, kind: 'ocean', match: ['Arctic Ocean'] },
  { id: 'southern', n: n('Southern Ocean', 'Océano Antártico', 'Südlicher Ozean'), c: ['oc', 'sa', 'af'], t: 2, kind: 'ocean', match: ['SOUTHERN OCEAN'] },
  { id: 'mediterranean', n: n('Mediterranean Sea', 'Mar Mediterráneo', 'Mittelmeer'), c: ['eu', 'af', 'as'], t: 1, match: ['Mediterranean Sea', 'Tyrrhenian Sea', 'Adriatic Sea', 'Ionian Sea', 'Balearic Sea', 'Aegean Sea', 'Sea of Crete', 'Ligurian Sea', 'Alboran Sea', 'Golfe du Lion', 'Gulf of Gabès', 'Gulf of Sidra'] },
  { id: 'caribbean', n: n('Caribbean Sea', 'Mar Caribe', 'Karibisches Meer'), c: ['na', 'sa'], t: 1, match: ['Caribbean Sea'] },
  { id: 'gulf-of-mexico', n: n('Gulf of Mexico', 'Golfo de México', 'Golf von Mexiko'), c: ['na'], t: 1, match: ['Gulf of Mexico', 'Bahía de Campeche'] },
  { id: 'north-sea', n: n('North Sea', 'Mar del Norte', 'Nordsee'), c: ['eu'], t: 1, match: ['North Sea'] },
  { id: 'baltic', n: n('Baltic Sea', 'Mar Báltico', 'Ostsee'), c: ['eu'], t: 1, match: ['Baltic Sea', 'Gulf of Bothnia', 'Gulf of Finland', 'Gulf of Riga'] },
  { id: 'black-sea', n: n('Black Sea', 'Mar Negro', 'Schwarzes Meer'), c: ['eu', 'as'], t: 1, match: ['Black Sea'] },
  { id: 'red-sea', n: n('Red Sea', 'Mar Rojo', 'Rotes Meer'), c: ['af', 'as'], t: 1, match: ['Red Sea'] },
  { id: 'caspian', n: n('Caspian Sea', 'Mar Caspio', 'Kaspisches Meer'), c: ['eu', 'as'], t: 1, match: ['Caspian Sea'] },
  { id: 'arabian', n: n('Arabian Sea', 'Mar Arábigo', 'Arabisches Meer'), c: ['as'], t: 2, match: ['Arabian Sea'] },
  { id: 'bengal', n: n('Bay of Bengal', 'Golfo de Bengala', 'Golf von Bengalen'), c: ['as'], t: 2, match: ['Bay of Bengal'] },
  { id: 'south-china', n: n('South China Sea', 'Mar de la China Meridional', 'Südchinesisches Meer'), c: ['as'], t: 2, match: ['South China Sea'] },
  { id: 'east-china', n: n('East China Sea', 'Mar de la China Oriental', 'Ostchinesisches Meer'), c: ['as'], t: 3, match: ['East China Sea'] },
  { id: 'japan', n: n('Sea of Japan', 'Mar de Japón', 'Japanisches Meer'), c: ['as'], t: 2, match: ['Sea of Japan'] },
  { id: 'yellow-sea', n: n('Yellow Sea', 'Mar Amarillo', 'Gelbes Meer'), c: ['as'], t: 3, match: ['Yellow Sea'] },
  { id: 'philippine', n: n('Philippine Sea', 'Mar de Filipinas', 'Philippinensee'), c: ['as'], t: 3, match: ['Philippine Sea'] },
  { id: 'coral', n: n('Coral Sea', 'Mar del Coral', 'Korallenmeer'), c: ['oc'], t: 2, match: ['Coral Sea'] },
  { id: 'tasman', n: n('Tasman Sea', 'Mar de Tasmania', 'Tasmansee'), c: ['oc'], t: 2, match: ['Tasman Sea'] },
  { id: 'arafura', n: n('Arafura Sea', 'Mar de Arafura', 'Arafurasee'), c: ['oc', 'as'], t: 3, match: ['Arafura Sea'] },
  { id: 'java', n: n('Java Sea', 'Mar de Java', 'Javasee'), c: ['as'], t: 3, match: ['Java Sea'] },
  { id: 'bering', n: n('Bering Sea', 'Mar de Bering', 'Beringmeer'), c: ['na', 'as'], t: 2, match: ['Bering Sea'] },
  { id: 'okhotsk', n: n('Sea of Okhotsk', 'Mar de Ojotsk', 'Ochotskisches Meer'), c: ['as'], t: 3, match: ['Sea of Okhotsk'] },
  { id: 'hudson', n: n('Hudson Bay', 'Bahía de Hudson', 'Hudson Bay'), c: ['na'], t: 2, match: ['Hudson Bay'] },
  { id: 'alaska', n: n('Gulf of Alaska', 'Golfo de Alaska', 'Golf von Alaska'), c: ['na'], t: 3, match: ['Gulf of Alaska'] },
  { id: 'labrador', n: n('Labrador Sea', 'Mar de Labrador', 'Labradorsee'), c: ['na'], t: 3, match: ['Labrador Sea'] },
  { id: 'beaufort', n: n('Beaufort Sea', 'Mar de Beaufort', 'Beaufortsee'), c: ['na'], t: 3, match: ['Beaufort Sea'] },
  { id: 'california', n: n('Gulf of California', 'Golfo de California', 'Golf von Kalifornien'), c: ['na'], t: 3, match: ['Golfo de California'] },
  { id: 'barents', n: n('Barents Sea', 'Mar de Barents', 'Barentssee'), c: ['eu'], t: 2, match: ['Barents Sea'] },
  { id: 'norwegian', n: n('Norwegian Sea', 'Mar de Noruega', 'Europäisches Nordmeer'), c: ['eu'], t: 2, match: ['Norwegian Sea'] },
  { id: 'adriatic', n: n('Adriatic Sea', 'Mar Adriático', 'Adriatisches Meer'), c: ['eu'], t: 2, match: ['Adriatic Sea'] },
  { id: 'aegean', n: n('Aegean Sea', 'Mar Egeo', 'Ägäisches Meer'), c: ['eu'], t: 2, match: ['Aegean Sea'] },
  { id: 'tyrrhenian', n: n('Tyrrhenian Sea', 'Mar Tirreno', 'Tyrrhenisches Meer'), c: ['eu'], t: 3, match: ['Tyrrhenian Sea'] },
  { id: 'biscay', n: n('Bay of Biscay', 'Golfo de Vizcaya', 'Golf von Biskaya'), c: ['eu'], t: 3, match: ['Bay of Biscay'] },
  { id: 'english-channel', n: n('English Channel', 'Canal de la Mancha', 'Ärmelkanal'), c: ['eu'], t: 3, match: ['English Channel'] },
  { id: 'persian-gulf', n: n('Persian Gulf', 'Golfo Pérsico', 'Persischer Golf'), c: ['as'], t: 2, match: ['Persian Gulf'] },
  { id: 'aden', n: n('Gulf of Aden', 'Golfo de Adén', 'Golf von Aden'), c: ['af', 'as'], t: 3, match: ['Gulf of Aden'] },
  { id: 'guinea', n: n('Gulf of Guinea', 'Golfo de Guinea', 'Golf von Guinea'), c: ['af'], t: 2, match: ['Gulf of Guinea'] },
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
