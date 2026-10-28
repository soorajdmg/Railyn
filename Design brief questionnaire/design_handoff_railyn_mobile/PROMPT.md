# Prompt for Claude Code

Copy the `design_handoff_railyn_mobile/` folder into the root of the Railyn repo, then paste this:

---

Read `design_handoff_railyn_mobile/README.md` (mobile layout, shared tokens and behaviour) and `design_handoff_railyn_mobile/DESKTOP.md` (desktop layout) in full before writing any code. They are high-fidelity specs for the Railyn PWA. The two prototypes in `reference/` show the exact look and behaviour:
- `RailynAppV2.dc.html` is mobile
- `Railyn Desktop.dc.html` is desktop

Both are design references: rebuild them properly in our stack and do not copy the HTML. To view them, run `npx serve design_handoff_railyn_mobile/reference` and open each file.

Stack: React 18 + TypeScript + Vite, Tailwind CSS, MapLibre GL JS, React Router, TanStack Query, lucide-react, and vite-plugin-pwa. The frontend goes in `frontend/`. Keep `docker-compose.yml` working.

Build one app with two shells: `DesktopShell` at 1024px and wider, `MobileShell` below that. They share the routes, state, components and map logic. Work in this order, and check in with me after each step:
1. **Scaffold and tokens.** Put the colours, radii, shadows and type sizes from README "Design tokens" into `tailwind.config.ts`, load Inter, and add the PWA manifest and safe areas.
2. **Shared components.** EntityBadge, EntityRow, Chip/ChipRow, Segmented, Switch, DayChips, CircleIconButton, SectionHeader, KVCard, TimelineRow, TimetableTable, JourneyCard, FromToCard, ScheduledNotice, Toast, Breadcrumbs, and skeleton/empty/error/offline states.
3. **Map module.** One persistent MapLibre instance with every layer from the README. It also needs hover tooltips, linked hover highlighting, a context label, fit-to-entity that accounts for the panel or sheet, and the layers popover with its three switches.
4. **Routing and state.** All the routes in both docs, a detail stack, deep links, the keyboard shortcuts (`/`, Enter, Esc), and the browser back button closing things in the right order.
5. **Desktop shell.** Full-bleed map, the floating 460px glass panel, primary tiles and secondary pills, global search with a dropdown, section views and detail views, exactly as in DESKTOP.md.
6. **Mobile shell.** The bottom sheet with peek, half and full positions, and the floating pill nav, as in README.md.
7. **Data.** A typed mock API backed by `reference/sample-data.js`, using the endpoint shapes listed in the README, so we can switch to the FastAPI backend later.

Rules:
- Match the colours, spacing, radii and type exactly. Use the entity colour coding everywhere: train blue, station teal, line violet, zone/division amber. Keep everything else neutral.
- Touch targets must be at least 44px on mobile. Use tabular numerals for times.
- Never imply live data. Keep the "scheduled, not live" notices where the specs place them.
- Strict TypeScript, no `any`. Keep components small and composable.
- After each step, compare the app side by side with the matching prototype: 390×844 for mobile, and 1440×900 and 1280×800 for desktop.
