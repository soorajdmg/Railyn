# Desktop layout (≥ 1100px)

Reference: `reference/Railyn Desktop.dc.html`. It uses the same tokens, data, entity colour coding and components as the mobile spec in `README.md`. The app is **responsive**: below 1100px, render the mobile layout (map + bottom sheet + pill nav); from 1100px up, render this layout. Share all screen content components between the two and swap only the shell.

## Shell
CSS grid, `grid-template-columns: 88px 480px minmax(0,1fr)`, height 100vh.

1. **Left rail (88px, `#0c111a`)**
   - "R" logo tile at the top: 44×44, radius 14, blue
   - 8 nav buttons (68×60, radius 16), each an icon (20px) above a label (11px/600): Overview, Trains, Stations, Lines, Zones, Between, Saved, Info
   - active: icon `#6ea0ff`, label white, background `rgba(110,160,255,.18)`. Inactive: `rgba(255,255,255,.62)`
   - footer text "Timetable v{version}" at 10px, white 50%
2. **Panel (480px, `#f4f6f9`, 1px right border `#e3e7ee`)**
   - global search pill: 48px, radius 24, with a `/` key hint. The dropdown under it holds grouped results (max 5 per group), or "Recently viewed" / suggestions when the field is empty
   - a scrolling content area below it
3. **Map** fills the rest of the screen.

## Panel content
- **No entity open:** the content for the selected section.
  - Overview: 3×2 stat tiles (with entity-colour dots, clickable), journey planner, recently viewed, junctions, corridors, scheduled notice
  - Trains: filter input; type and day chips; sort segmented control (Number / Departure / Distance / Duration); rows showing badge, name, type pill, route, days, times and "duration · km"
  - Stations: filter input, division chips, "Junctions only" switch
  - Lines
  - Zones: expandable zone → division → station-chip tree
  - Between: From/To card, chips, result cards. **All matching routes are drawn on the map live**
  - Saved: includes a "Clear history" action
  - Info: includes the keyboard shortcuts table
- **Entity open:** a header row with a Back button and a breadcrumb (`Section / A / B`, every crumb clickable), plus bookmark and copy-link buttons. Below that: kicker, 26px title, code pill and subtitle, then the entity body.
  - **Train:** journey card with 4 pills (adds an "avg km/h" pill); timetable table with columns `marker | Station | Arr | Dep | Halt | Km | Day`; related trains; lines used
  - **Station:** KV card (adds "Trains serving"); trains table with columns `Arr | Dep | Train | Type`
  - **Line:** violet sequence markers (`#7a5af5`, connector `#cbbdfb`)
  - **Zone / Division:** 4-column stats, an amber "Highlight on map" button, and sub-lists
- Links inside an entity push onto the breadcrumb stack. Opening something from search, lists or the map replaces the stack and switches the rail to the matching section.

## Map overlays
- **Context chip** (top-left): shows what's selected, for example "Route · 16301 Coastal Express". It has a coloured dot for the entity type and a clear (×) button.
- **Controls** (top-right), two white stacks with radius 22: [zoom +, zoom −] and [fit coverage, layers, locate]. The layers popover has switches for coverage outline, station labels, and all stations at any zoom.
- **Legend** (bottom-left), always visible: Junction, Station, Line, Konkan, Train route, Line view, Origin/selected, Coverage.
- **Attribution** (bottom-right), always visible.
- **Hover tooltip:** a dark card above stations or lines showing name + code and "Junction · N trains · Division".
- **Cross-highlight:** hovering a station row anywhere in the panel draws a 13px teal ring on that station on the map.
- Fit padding: `{top:90, bottom:110, left:70, right:110}`.

## Keyboard and URL
- `/` focuses search; `Enter` opens the top result; `Esc` closes search, then the layers popover, then goes back.
- The URL hash, or real routes in production, mirrors state: `/train/:n`, `/station/:code`, `/line/:id`, `/zone/:id`, `/division/:id`, `/{section}`. Reloading restores the view.
