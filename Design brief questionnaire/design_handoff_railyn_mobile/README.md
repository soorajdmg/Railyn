# Handoff: Railyn — Indian Railways Network Explorer (mobile PWA)

## Overview
Railyn is a mobile-first PWA for exploring the Indian Railways network on a map. It covers scheduled train routes and timetables, station profiles, railway lines and corridors, trains between two stations, and the zone → division → station hierarchy. It shows **scheduled data only**, never live positions. The first release covers Kerala plus the Konkan corridor.

Target stack (from the project brief): **React + TypeScript + Vite, Tailwind CSS, MapLibre GL JS**, with a **FastAPI + PostgreSQL/PostGIS** backend serving REST APIs and vector tiles.

## About the design files
`reference/RailynAppV2.dc.html` is a **design reference built in HTML**. It is a working prototype that shows the intended look and behaviour; it is not production code to copy. Rebuild it in the target stack using idiomatic React components, Tailwind and MapLibre.

To view it, open `reference/RailynAppV2.dc.html` in a browser served from the same folder as `support.js`. It renders a 390×844 phone. The `layout` prop switches between `Docked` (full-width sheet) and `Floating` (sheet inset 10px). **Build the Docked version.**

`reference/sample-data.js` holds the placeholder stations, lines, divisions, zones and a timetable generator. Use it as seed/mock data only, because the trains and timetables are made up. Station names and coordinates are real but approximate.

## Fidelity
**High-fidelity.** Colours, type, radii, spacing and interactions are final. Recreate them closely. Exact hex values are given below.

---

## Design tokens

### Colours
| Token | Hex | Use |
|---|---|---|
| `bg` | `#f4f6f9` | App background, panels |
| `surface` | `#ffffff` | Cards on panels, search bar, map buttons |
| `surface-2` | `#f1f4f8` | Cards inside the bottom sheet |
| `fill` | `#eef1f5` | Circle icon buttons, inactive chips/day chips, neutral pills, segmented track (`#e6eaf0` on panels) |
| `line` | `#eef1f5` (on white) / `#e6eaf0` (on surface-2) | 1px row dividers |
| `ink` | `#0f1722` | Primary text |
| `ink-2` | `#5b6574` | Secondary text |
| `ink-3` | `#7a8494` | Tertiary / placeholder |
| `ink-4` | `#9aa3b2` | Chevron, inactive day chip text |
| `nav` | `#0c111a` | Floating pill nav, toasts, phone bezel |
| **Primary: blue** | `#2b6ef2`; hover `#1f5ee0`; tint `#e8f0fe`; ring `#cddcfd`; dashed connector `#b8cdf8`; deep text `#1d4fb8` | Trains, routes, primary actions, active states |
| **Secondary: teal** | `#0fa390`; tint `#dff5f0`; text `#0b7f70`; ring `#bfe9e0` | Stations, origin points, coverage outline |
| **Accent: violet** | `#7a5af5`; tint `#efeafe`; text `#5b3fd1` | Railway lines and corridors (badges, line sheet header, map route in line view) |
| **Accent: amber** | `#e59a1a`; tint `#fdf1dc`; text `#a2620a` | Zones, divisions, time cues ("today" dot, `+1d`, Upcoming toggle on) |
| Map: line ink | `#3b4657` | Railway lines, station strokes |
| Map: Konkan | `#9aa3b2` dotted | Konkan Railway line |
| Toggle off | `#d5dbe4` | Switch track |
| Passing stop | `#c3cad6` | Timeline marker for non-stopping stations |

**Entity colour coding.** Badges always use the tint as background and the text colour as foreground:
train → blue, station → teal, line → violet, zone/division → amber. The accents are only ever used as small tints and markers, never as large fills. The one exception is the blue "Scheduled, not live" card on Info.

### Typography
**Inter** (Google Fonts, weights 400/500/600/700), with `-webkit-font-smoothing: antialiased` and tabular numerals for times.
| Role | Size / weight / tracking |
|---|---|
| Panel title (h1) | 32px / 700 / -0.03em / lh 1.1 (Explore: 30px) |
| Sheet title | 23px / 700 / -0.025em / lh 1.2, `text-wrap: pretty` |
| Big time | 22–24px / 700 / -0.02em |
| Section header | 17px / 700 / -0.01em |
| Row title | 15px / 600 / -0.01em |
| Body / KV | 14px / 400–600 |
| Meta | 12–13px / 400–500, ink-2 |
| Kicker | 13px / 600, entity colour |
| Badge / pill | 11–12px / 600–700 |

### Radii
Phone 50px (bezel 60) · sheet 30px (top corners) · large cards 20–24px · info card 24px · buttons 16px · segmented track 14–16 / thumb 11–12 · entity badge 11px · code pill 8px · chips & pills fully round · circle buttons 50%.

### Shadows
- Search bar: `0 8px 24px rgba(15,23,34,.10)`
- Map buttons: `0 6px 18px rgba(15,23,34,.12)`
- Sheet: `0 -8px 32px rgba(15,23,34,.14)`
- Layers popover: `0 16px 40px rgba(15,23,34,.18)`
- Pill nav / toast: `0 12px 32px rgba(12,17,26,.35)`
- Panel cards: `0 2px 10px rgba(15,23,34,.05)`
- Segmented thumb: `0 1px 4px rgba(15,23,34,.12)`

### Spacing
Screen gutter 16px (14px for map overlays). Card padding 14–16px. Row min-height 60–64px (48–52px for compact rows). Section header margin `24px 4px 10px`. Touch targets ≥ 44px (chips are 40px tall within 44px rows).

### Icons
Lucide (`lucide-react`), stroke 2, round caps. Icons used: map, search, compass, bookmark, info, chevron-left, chevron-right, share (upload variant), x, layers, navigation, train-front (square variant), clock, arrow-up-down.

---

## App shell
- Full-screen MapLibre map always mounted underneath (keep it mounted across tabs).
- Status bar area is 47px. It is transparent over the map and `bg` on panels. Respect `env(safe-area-inset-*)`.
- **Bottom nav: a floating black pill** (`#0c111a`), centred, `bottom: 26px`, 64px tall, radius 32px, 8px horizontal padding, 4px gap. It holds 5 icon buttons (52×48, radius 24): Map, Search, Explore, Saved, Info. Active: icon `#6ea0ff` on `rgba(110,160,255,.18)`. Inactive: `rgba(255,255,255,.72)`. Icons only, with an `aria-label` on each.
- Search, Explore, Saved and Info are full-screen panels over the map (`bg`, 14px top padding, 120px bottom padding to clear the nav).
- Toast: dark card at top 118px, radius 18px, shown for 2.2s (used for "Link copied", "Saved to this device").

## Screens

### 1. Map (home)
- **Search pill**: top 54px, inset 14px, 54px tall, radius 27, white. It has a search icon, the placeholder "Train, station, line or zone" (ink-3), and on the right a "Railyn" badge (blue tint, 38px tall). Tapping it opens the Search tab.
- **Coverage chip** (top 118px, left): white 92% pill, 32px, with a teal dashed 12px circle and the text "Coverage: Kerala + Konkan". Below it, the **attribution** "© OpenStreetMap contributors · OpenFreeMap" at 10px on white 80%. It must always be visible.
- **Right controls** (top 118px): 48px circular buttons for Layers (turns blue when its panel is open) and Locate (blue icon).
- **Layers popover**: 240px wide, radius 22. It shows a legend (Junction, Station "zoom in", Railway line, Konkan Railway, Selected route, Origin, Line view) and two switches: Coverage outline and Station labels. Switch: 46×28 track, 22px knob, `left 3px` off / `21px` on, 0.2s transitions.
- **MapLibre layers** (base style: OpenFreeMap Positron, `https://tiles.openfreemap.org/styles/positron`):
  - coverage polygon: teal outline, dashed `[3,2]`, at fill opacity 0.035 (the prototype uses blue for the fill; teal throughout is fine)
  - lines: `#3b4657`, width interpolated 1.5 at z5 → 3.5 at z10; Konkan dotted `#9aa3b2`
  - transparent 16px hit layer for tapping lines
  - **route-glow**: route colour at opacity 0.28, `line-blur` 6, width 10 → 18
  - **route**: blue (violet when viewing a line), width 3.5 → 6, round caps and joins
  - junction circles: always visible, radius 4 → 7, white fill, 2.5px ink stroke. Other stations appear from `minzoom 7`, radius 4
  - route stops: white fill, 2.5px stroke in the route colour
  - selected: 16px halo at 0.18 opacity plus an 8px dot with a white stroke. **Teal for the origin or selected station**, blue for the destination
  - labels: Noto Sans Bold 11px, junction labels always shown, all labels from z7.5
  - Zoom-dependent content follows the brief: country zoom shows zones and corridors, regional shows lines and junctions, local shows all stations. In production, serve these as vector tiles from PostGIS.
- Tapping a station opens the station sheet; tapping a line opens the line sheet. A tap on the map replaces the sheet stack.
- On open, fit the map to the entity with `padding {top:120, bottom: 844-400+16, left:40, right:70}` and a 700ms ease (a single station eases to z9.5).

### 2. Bottom sheet (central pattern)
- Three snap positions (top offset in a 844px viewport): **peek 628**, **half 400**, **full 54**. Transition `top .32s cubic-bezier(.2,.8,.2,1)`. There is no transition while dragging.
- Background `rgba(255,255,255,.9)` with `backdrop-filter: blur(24px) saturate(1.4)`. Top corners radius 30. In the Docked layout it runs the full width.
- **Header** (the drag area; drag snaps to the nearest position; a tap cycles peek → half → full → half):
  - 40×5 grabber `#cfd5de`
  - row of: [Back circle button if the stack has more than one entry] · kicker (13/600, entity colour) · bookmark (trains and stations; fills blue when saved) · share · close. Circle buttons are 38px on `fill`
  - title 23/700
  - code pill (entity tint, 12/700, radius 8) followed by a subtitle (13px, ink-2, ellipsis)
  - in full state the header gets a 1px `#e6eaf0` bottom border
- The body scrolls, with 116px bottom padding to clear the nav.
- Sheet history is a stack (`train → station → train …`). The device back button pops the stack first, then closes the sheet, then leaves the page.

### 3. Train (`/train/:number`)
Kicker "Train · {type}", title = name, pill = number, subtitle "{src} → {dst}".
1. **Journey card** (`surface-2`, radius 22, padding 16):
   - three white pills (30px tall, nowrap): clock icon + duration, distance, "N halts"
   - origin row: teal dashed 20px circle · station name 16/600 · "{CODE} · Departs" · time 22/700
   - connector: a dashed `#b8cdf8` vertical line with a blue train icon in the middle
   - destination row: blue 20px dot with a 4px `#cddcfd` ring · name · "Arrives" · time, plus an amber superscript `+1d` when it arrives on a later day
2. **Day chips**: 7 equal columns, 42px, fully round. Running days are blue with white text; other days are `fill` with ink-4 text. Today's chip has a 5px amber dot. The caption reads "Runs daily / Runs Mon Wed Fri from origin · ● today".
3. Buttons (2 columns, 50px, radius 16): **Save** (blue) and **Return · {pair}** (`fill`).
4. **Timetable** with a segmented control (Halts | All stations; track `fill`, white thumb). Rows are 60px in a `surface-2` card, with a dashed `#b8cdf8` line running through a 20px column. Markers: origin 18px teal with a `#bfe9e0` 4px ring; destination 18px blue with a `#cddcfd` ring; halt 14px white with a 3px blue border; passing 8px `#c3cad6`, with the row at 60% opacity. Columns: name 15/600 with "CODE · {n} min halt · {km} km · Day {d}", then Arr (ink-2) and Dep (700) right-aligned 48px each. Passing rows show "pass" in the Dep column.
5. Related trains (entity rows).
6. Data note: "Timetable v{version} · Last verified {date}" (12px ink-3).
7. **Scheduled notice**: blue tint card, radius 18, text `#1d4fb8`, info icon, "Scheduled timings only. This is not live running status or the train's current position."

### 4. Station (`/station/:code`)
Kicker "Station · Junction" (teal), code pill teal, subtitle "{Zone} › {Division} Division".
- KV card: Station code · Coordinates (4 decimals) · Zone › (blue link to Explore zone) · Division › (link) · Type.
- **Trains serving**, with:
  - filter chips: day (All, Mon…Sun); direction (Both ways / Northbound / Southbound, worked out by comparing the destination's latitude with the station's); type (All types, Express, Superfast, Intercity, Passenger)
  - chips are 40px, fully round; active is blue with white text; inactive is white with a `#e3e7ee` border
  - "Upcoming after HH:MM" switch, using the device clock (switch is amber when on), captioned "Device clock · scheduled times"
  - rows: time 18/700 · "{num} · {name}" · "To {dest} · {days}" · type pill
  - empty state "No scheduled trains match these filters."
- Connected lines (violet badges) and Nearby stations (the 3 nearest, "{km} km away · {division}").

### 5. Line / corridor (`/line/:id`)
Violet kicker and pill. KV card (Network, Length, Stations, Ends), an ordered station sequence timeline (14px white markers with a 3px blue border, dashed connector, cumulative km), and trains along the line. The map route is violet.

### 6. Between stations (`/between?from=&to=`)
Reached from Search → "Between stations".
- **From/To card** (white, radius 22): From row (teal dashed circle) and To row (blue ringed dot), each a native select showing "Name (CODE)". A 44px circular blue-tint **swap** button sits vertically centred on the right.
- Filters: Day (Any, Mon…Sun), Departure (Any time / Morning 04–12 / Afternoon 12–18 / Night 18–04), Train type.
- Result cards (radius 20, padding 14–16): "{num} · {name}" + type pill; then dep time 24/700 — dashed line — blue-tint duration pill with a train icon — dashed line — arr time (+n); then "{km} km · {days}".
- Primary button "Show N trains on map". It opens a "Between stations" sheet and draws each train's segment from→to as a route.

### 7. Search
- Title "Search". A segmented control spans the full width: Everything | Between stations.
- Input pill (54px, radius 27, white, search icon).
- When empty: "Recent" chips (white pills, stored locally) and the helper text "Matches trains, stations, zones, divisions and lines. Spelling mistakes are tolerated."
- When typing, results are grouped: Trains, Stations, Lines, Zones & networks, Divisions. Each group has a count and a white card of entity rows. Matching is typo-tolerant: prefix, then substring, then Levenshtein ≤1 (≤2 for queries over 5 characters) on word prefixes. In production use Postgres `pg_trgm`, paginated with infinite scroll.
- Empty state: "No matches for "{q}". Try a train number or a station code."

### 8. Explore (`/zone/:id`, `/division/:id`)
- Root: "Administrative hierarchy" / "Explore". Section "Railway zones". Zones outside coverage are listed at 50% opacity as "Not yet covered" and tapping them shows a toast. A separate section "Separately managed networks" holds Konkan Railway.
- Zone page: back link, kicker, title; a 4-column stat card (Divisions/Regions, Stations, Lines, Trains) with 1px dividers and 24/700 numbers; meta "Headquarters: …"; a blue-tint "View on map" button (fits the map to the zone's stations and highlights them); the divisions list.
- Division page: stats (Stations, Junctions, Lines, Trains), Lines & corridors, Stations.
- Entity row: 62–64px, 46×36 badge (entity tint, radius 11, code 12/700), title 15/600, subtitle 13px ink-2, chevron.

### 9. Saved
"Stored on this device. No account needed." Favourites and Recently viewed (last 12), stored in localStorage (IndexedDB in production). Empty states: "Nothing saved yet. Tap the bookmark on any train or station." / "Trains, stations and lines you open will appear here."

### 10. Info
- Blue card (radius 24, padding 20, white text) with a clock icon in a white 18% circle: **"Scheduled, not live"**, "Railyn shows planned routes and timetabled times. It does not show where a train is right now, delays, cancellations or platform changes."
- Coverage KV with a teal "Prototype" tag: Region, Stations, Lines, Train services, Last import, Timetable version.
- Data sources: OpenStreetMap (ODbL), OpenFreeMap (tiles), Timetable (source + licence).

---

## Interactions and behaviour
- Sheet drag uses pointer events on the header and ignores drags that start on buttons. A move of 4px or more counts as a drag; anything less is a tap. On release it snaps to the nearest position.
- Opening an entity from inside a sheet pushes onto the stack. Opening one from the map or a search result replaces the stack (the prototype pushes from search; either is acceptable).
- Opening an entity sets the sheet to half if it was at peek, resets the timetable to "Halts", and adds the entity to Recently viewed.
- Share copies `https://railyn.app/{kind}/{id}` (or `/between?from=&to=`) and shows a toast. Use the Web Share API when it's available.
- Locate: geolocation, then ease to the user (the prototype simulates Ernakulam).
- Hover/pressed: rows tint `#f7f9fc` (on white) or `#e9edf2` (on surface-2); buttons darken one step. Focus-visible: 2px blue outline with a 2px offset.
- Loading: skeleton rows the same size as the real rows. Offline: cached data plus a banner. Errors: an inline card with a retry button.

## State
- `tab`, `sheetStack[]`, `snap`, `dragTop`
- Search: `q`, `mode`; Between: `from`, `to`, `day`, `timeWindow`, `type`
- Station filters: `day`, `direction`, `type`, `upcoming`; train: `showAllStations`
- Explore: `exploreStack[]`; layers: `coverage`, `labels`
- Persisted: `favourites[]`, `recentlyViewed[]`, `recentSearches[]`
- Use the URL as the source of truth for the routes above (React Router), and TanStack Query for API data.

## Suggested API (FastAPI)
`GET /search?q=&page=` · `GET /trains/{number}` (with ordered stops and route geometry) · `GET /stations/{code}` · `GET /stations/{code}/trains?day=&dir=&type=&after=` · `GET /lines/{id}` · `GET /zones` · `GET /zones/{id}` · `GET /divisions/{id}` · `GET /between?from=&to=&day=&type=&window=` · `GET /tiles/{z}/{x}/{y}.pbf` · `GET /meta/coverage`.

## Assets
No raster assets. Icons come from Lucide, the base map from OpenFreeMap Positron (OSM data, so attribution is required), and the font is Inter from Google Fonts.

## Files
- `reference/RailynAppV2.dc.html`: the full prototype (template and logic). Use it as the visual and behavioural source of truth.
- `reference/support.js`: the runtime needed to open the prototype locally.
- `reference/sample-data.js`: seed stations, lines, divisions, zones and the generated timetables.
- `reference/Railyn Desktop.dc.html`: the desktop prototype.
- `DESKTOP.md`: the desktop layout spec (≥1100px).
- `PROMPT.md`: the prompt to paste into Claude Code.
