/**
 * Draws the Finding us map from raw OpenStreetMap data.
 *
 * Why this exists rather than an embed or a screenshot:
 *
 *   - CLAUDE.md forbids a third-party map embed. It is the single heaviest thing
 *     that could land on this page, and this is a paid-social landing page where
 *     load time is a conversion input.
 *   - Screenshotting openstreetmap.org would mean redistributing their tiles,
 *     which their tile usage policy does not allow for a production site.
 *   - A Google or Mapbox static image needs an API key and a live third-party
 *     request on every page view.
 *
 * Producing our own render from the underlying OSM data is explicitly allowed
 * under the ODbL provided it is attributed, needs no key, makes no request at
 * page load, and is crisp at any size. The attribution is rendered as visible
 * micro-copy next to the map - see `location.mapAttribution` in lib/content.ts.
 * It is a licence obligation, not a nicety, so do not remove it.
 *
 * The output is basemap geometry ONLY. No text. The station and clinic pins and
 * their labels are HTML positioned on top in ClosingBand.tsx, so they stay real
 * text in the site font rather than paths baked into an image.
 *
 * Run: npm run build-map
 * Committed output: public/images/map/colindale-beaufort-park.svg
 */

import { promises as fs } from 'node:fs';

const OUT = 'public/images/map/colindale-beaufort-park.svg';
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const UA = 'hannah-london-colindale-site/1.0 (build-map; arun@halotechlab.com)';

/**
 * The two points the map exists to show. Both confirmed against OSM /
 * Nominatim - see the plan and lib/content.ts.
 *
 * NOTE: the clinic point is the NW9 5QF postcode centroid, on Boulevard Drive.
 * The precise position of number 12 within Beaufort Park is not verified in open
 * data and is worth confirming with the clinic.
 */
const STATION = { lon: -0.2498961, lat: 51.5954373 };
const CLINIC = { lon: -0.2407700, lat: 51.5956100 };

/** SVG canvas. 16:9 to match the box the map sits in. */
const VIEW = { w: 1600, h: 900 };

/**
 * How much of the frame width the station-to-clinic span should occupy. 0.58
 * leaves enough context either side that the clinic reads as sitting inside
 * Beaufort Park rather than floating at the edge of a crop.
 */
const SPAN_FRACTION = 0.58;

// ---------------------------------------------------------------------------
// Web Mercator. Working in projected space rather than raw degrees is what
// keeps the render undistorted; at this zoom the difference is small but there
// is no reason to be sloppy about it.
// ---------------------------------------------------------------------------

const mercX = (lon) => (lon * Math.PI) / 180;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const invMercY = (y) => ((Math.atan(Math.sinh(y)) * 180) / Math.PI);
const invMercX = (x) => (x * 180) / Math.PI;

// Frame the window on the midpoint of the two points, sized so their separation
// fills SPAN_FRACTION of the width. The height then follows from the 16:9
// aspect, which is what stops the projection stretching.
const midX = (mercX(STATION.lon) + mercX(CLINIC.lon)) / 2;
const midY = (mercY(STATION.lat) + mercY(CLINIC.lat)) / 2;
const spanX = Math.abs(mercX(CLINIC.lon) - mercX(STATION.lon));
const halfW = spanX / SPAN_FRACTION / 2;
const halfH = (halfW * VIEW.h) / VIEW.w;

const box = {
  xMin: midX - halfW,
  xMax: midX + halfW,
  yMin: midY - halfH,
  yMax: midY + halfH,
};

/** Projected metre-ish scale, for the scale bar and for sanity-checking. */
const metresPerLon = 111320 * Math.cos((midY ? invMercY(midY) : 0) * (Math.PI / 180));
const widthMetres = Math.abs(invMercX(box.xMax) - invMercX(box.xMin)) * metresPerLon;

/** Projected coordinate -> SVG coordinate. SVG y grows downward, Mercator y up. */
const toSvg = (lon, lat) => [
  ((mercX(lon) - box.xMin) / (box.xMax - box.xMin)) * VIEW.w,
  ((box.yMax - mercY(lat)) / (box.yMax - box.yMin)) * VIEW.h,
];

/** Fraction of the box, for positioning the HTML pins. */
const toPercent = (lon, lat) => {
  const [x, y] = toSvg(lon, lat);
  return { left: (x / VIEW.w) * 100, top: (y / VIEW.h) * 100 };
};

const latMin = invMercY(box.yMin);
const latMax = invMercY(box.yMax);
const lonMin = invMercX(box.xMin);
const lonMax = invMercX(box.xMax);

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

// A margin so roads and parks that cross the edge are drawn out to the border
// instead of stopping short of it.
const PAD = 0.0015;
const bbox = [latMin - PAD, lonMin - PAD, latMax + PAD, lonMax + PAD]
  .map((n) => n.toFixed(6))
  .join(',');

const query = `[out:json][timeout:90];
(
  way["highway"](${bbox});
  way["railway"~"^(rail|light_rail|subway)$"](${bbox});
  way["building"](${bbox});
  way["natural"="water"](${bbox});
  way["waterway"="riverbank"](${bbox});
  way["leisure"~"^(park|garden|pitch|playground|golf_course)$"](${bbox});
  way["landuse"~"^(grass|forest|meadow|recreation_ground|cemetery|allotments)$"](${bbox});
);
out geom;`;

console.log(`Window: ${widthMetres.toFixed(0)}m x ${((widthMetres * VIEW.h) / VIEW.w).toFixed(0)}m`);
console.log(`bbox:   ${bbox}`);

/**
 * Overpass is a free, shared, frequently overloaded service. It hands out 429s
 * and 504s readily, so: cache the raw response, keyed by the query itself, and
 * retry with backoff. Iterating on the drawing style should not mean re-querying
 * at all - delete the cache file to force a refetch.
 *
 * The cache lives outside public/ on purpose. Anything under public/ is served,
 * and a megabyte of raw OSM JSON is not something to publish by accident.
 */
const CACHE = '.cache/overpass.json';

async function fetchElements() {
  try {
    const cached = JSON.parse(await fs.readFile(CACHE, 'utf8'));
    if (cached.query === query) {
      console.log(`Using cached Overpass response (${CACHE}). Delete it to refetch.`);
      return cached.elements;
    }
    console.log('Cached response is for a different query; refetching.');
  } catch {
    /* no usable cache */
  }

  const delays = [0, 5000, 15000, 30000];
  for (const [attempt, wait] of delays.entries()) {
    if (wait) {
      console.log(`Waiting ${wait / 1000}s before retry ${attempt}...`);
      await new Promise((r) => setTimeout(r, wait));
    }
    console.log(`Querying Overpass (attempt ${attempt + 1}/${delays.length})...`);
    let res;
    try {
      res = await fetch(OVERPASS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
        body: new URLSearchParams({ data: query }),
      });
    } catch (err) {
      console.warn(`  network error: ${err.message}`);
      continue;
    }
    if (res.ok) {
      const { elements } = await res.json();
      await fs.mkdir('.cache', { recursive: true });
      await fs.writeFile(CACHE, JSON.stringify({ query, elements }), 'utf8');
      return elements;
    }
    console.warn(`  Overpass ${res.status} ${res.statusText}`);
  }
  throw new Error('Overpass would not answer after 4 attempts. Try again later.');
}

const elements = await fetchElements();
console.log(`${elements.length} ways.`);

// ---------------------------------------------------------------------------
// Style. Everything is a light warm neutral drawn from the palette in
// tailwind.config.js, so the two dark pins are the only things that carry
// contrast and the map reads as designed rather than bolted on.
// ---------------------------------------------------------------------------

const BG = '#F6F4F1'; // soft
const GREEN = '#E2EADD';
const WATER = '#D6E0E4';
const BUILDING = '#E9E4DC';

/**
 * Road classes, widest first so the thin ones are drawn on top.
 *
 * These are deliberately darker than a first pass at them: at ~600px wide the
 * whole render has to carry structure from a 1600-unit canvas, and pale hairlines
 * that look tasteful at full size disappear entirely once scaled down.
 */
const ROADS = [
  { match: ['motorway', 'motorway_link', 'trunk', 'trunk_link'], width: 10, colour: '#BEB5A8' },
  { match: ['primary', 'primary_link'], width: 8, colour: '#C6BEB2' },
  { match: ['secondary', 'secondary_link', 'tertiary', 'tertiary_link'], width: 6.5, colour: '#CEC7BC' },
  { match: ['residential', 'unclassified', 'living_street'], width: 4.5, colour: '#D5CFC6' },
  { match: ['pedestrian'], width: 3.5, colour: '#DBD6CE' },
  { match: ['service'], width: 2.2, colour: '#DED9D2' },
  { match: ['footway', 'path', 'cycleway', 'steps', 'track'], width: 1.3, colour: '#DEDAD3' },
];

const AREA_TAGS = [
  { key: 'natural', values: ['water'], fill: WATER },
  { key: 'waterway', values: ['riverbank'], fill: WATER },
  { key: 'leisure', values: ['park', 'garden', 'pitch', 'playground', 'golf_course'], fill: GREEN },
  {
    key: 'landuse',
    values: ['grass', 'forest', 'meadow', 'recreation_ground', 'cemetery', 'allotments'],
    fill: GREEN,
  },
];

// ---------------------------------------------------------------------------
// Build paths
// ---------------------------------------------------------------------------

/**
 * Integer coordinates. The canvas is 1600 units wide and renders at roughly
 * 600px, so one unit is 0.375px - rounding to whole units is already below what
 * a screen can show, and it cuts the file size by about a third against one
 * decimal place.
 */
const fmt = (n) => Math.round(n).toString();

function toPath(geometry) {
  const pts = geometry.map((g) => toSvg(g.lon, g.lat));
  // Drop points that round to the same place as the previous one.
  const out = [];
  for (const [x, y] of pts) {
    const last = out[out.length - 1];
    if (!last || fmt(x) !== fmt(last[0]) || fmt(y) !== fmt(last[1])) out.push([x, y]);
  }
  if (out.length < 2) return null;
  return out.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${fmt(x)} ${fmt(y)}`).join('');
}

const isClosed = (g) =>
  g.length > 3 && g[0].lat === g[g.length - 1].lat && g[0].lon === g[g.length - 1].lon;

/** Reject anything so small it would render sub-pixel: pure file weight. */
function bigEnough(geometry, minSpan) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const g of geometry) {
    const [x, y] = toSvg(g.lon, g.lat);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return Math.max(maxX - minX, maxY - minY) >= minSpan;
}

const areas = new Map(AREA_TAGS.map((a) => [a.fill, []]));
const roads = new Map(ROADS.map((r) => [r.width, []]));
const buildings = [];
const rails = [];
let skipped = 0;

for (const el of elements) {
  const tags = el.tags ?? {};
  const geometry = (el.geometry ?? []).filter(Boolean);
  if (geometry.length < 2) continue;

  // Buildings before the other area tags: a block of flats tagged both
  // building and landuse should read as a building.
  if (tags.building && !tags.highway) {
    if (!bigEnough(geometry, 5)) { skipped++; continue; }
    const d = toPath(geometry);
    if (d) buildings.push(d + 'Z');
    continue;
  }

  const area = AREA_TAGS.find((a) => tags[a.key] && a.values.includes(tags[a.key]));
  if (area && isClosed(geometry) && !tags.highway) {
    if (!bigEnough(geometry, 6)) { skipped++; continue; }
    const d = toPath(geometry);
    if (d) areas.get(area.fill).push(d + 'Z');
    continue;
  }

  if (tags.railway) {
    if (!bigEnough(geometry, 4)) { skipped++; continue; }
    const d = toPath(geometry);
    if (d) rails.push(d);
    continue;
  }

  if (tags.highway) {
    const cls = ROADS.find((r) => r.match.includes(tags.highway));
    if (!cls) { skipped++; continue; }
    // Footways and service roads are the bulk of the element count and add
    // little at this size, so they have to clear a higher bar to be drawn.
    const minSpan = cls.width <= 2.2 ? 14 : 4;
    if (!bigEnough(geometry, minSpan)) { skipped++; continue; }
    const d = toPath(geometry);
    if (d) roads.get(cls.width).push(d);
  }
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

// `areas` is keyed by fill, and several tag groups share a fill (both the
// leisure and landuse greens), so iterate the distinct fills rather than
// AREA_TAGS or the same group gets emitted twice.
const areaLayers = [];
for (const [fill, paths] of areas) {
  if (!paths.length) continue;
  areaLayers.push(`<g fill="${fill}">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>`);
}

const roadLayers = [];
for (const cls of ROADS) {
  const paths = roads.get(cls.width);
  if (!paths?.length) continue;
  roadLayers.push(
    `<g stroke="${cls.colour}" stroke-width="${cls.width}" fill="none" ` +
      `stroke-linecap="round" stroke-linejoin="round">` +
      paths.map((d) => `<path d="${d}"/>`).join('') +
      `</g>`
  );
}

const buildingLayer = buildings.length
  ? `<g fill="${BUILDING}">${buildings.map((d) => `<path d="${d}"/>`).join('')}</g>`
  : '';

const railLayer = rails.length
  ? `<g stroke="#C3BCB2" stroke-width="3" fill="none" stroke-dasharray="12 9" ` +
    `stroke-linecap="butt">${rails.map((d) => `<path d="${d}"/>`).join('')}</g>`
  : '';

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" ` +
  `width="${VIEW.w}" height="${VIEW.h}" role="presentation">` +
  `<!-- Generated by scripts/build-map.mjs. Do not hand-edit; re-run npm run build-map. -->` +
  `<!-- Map data (c) OpenStreetMap contributors, ODbL. https://www.openstreetmap.org/copyright -->` +
  `<rect width="${VIEW.w}" height="${VIEW.h}" fill="${BG}"/>` +
  areaLayers.join('') +
  buildingLayer +
  roadLayers.join('') +
  railLayer +
  `</svg>`;

await fs.mkdir('public/images/map', { recursive: true });
await fs.writeFile(OUT, svg + '\n', 'utf8');

const bytes = (await fs.stat(OUT)).size;
const station = toPercent(STATION.lon, STATION.lat);
const clinic = toPercent(CLINIC.lon, CLINIC.lat);

console.log(`\nWrote ${OUT} - ${(bytes / 1024).toFixed(0)}KB`);
console.log(
  `Drew ${roadLayers.length} road classes, ${areaLayers.length} area layers, ` +
    `${buildings.length} buildings, ${rails.length} rail ways. ` +
    `Skipped ${skipped} sub-pixel or unstyled ways.`
);
console.log(`\nPin positions, as percentages of the box - paste into lib/content.ts:`);
console.log(`  station: { left: ${station.left.toFixed(2)}, top: ${station.top.toFixed(2)} }`);
console.log(`  clinic:  { left: ${clinic.left.toFixed(2)}, top: ${clinic.top.toFixed(2)} }`);
console.log(`\nBounding box, for the record:`);
console.log(`  lat ${latMin.toFixed(6)}..${latMax.toFixed(6)}  lon ${lonMin.toFixed(6)}..${lonMax.toFixed(6)}`);
