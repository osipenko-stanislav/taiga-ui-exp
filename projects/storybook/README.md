# Taiga UI Storybook

Published: <https://osipenko-stanislav.github.io/taiga-ui-exp/>.

GitHub Pages rebuilds from `experiments/colors` and `main` using `storybook-pages.yml`. To build the same project path
locally, run `STORYBOOK_BASE_HREF=/taiga-ui-exp/ npm run build:storybook`.

OTUS icon resolution and `otus-core` button motion are library defaults. The Storybook toolbar overrides the motion
signal only to demonstrate `otus-brand`; applications can provide `TUI_BUTTON_MOTION` with their own signal to switch
these modes. Colors, fonts, typography, tracking, stroke and motion styles live in the shared library sources.

Documentation / Styles / Layout / Otus global dimensions documents the 38 Figma dimension primitives.
`--otus-dimension-*` variables ship with the shared theme via `projects/styles/mixins/theme/otus-dimensions.less`.
Values use exact rem conversions at a 16px root size; `--otus-dimension-1-5` is 1.5px and `--otus-dimension-infinite`
preserves Figma's finite 100000px value. The shared theme links the 13 fixed TUI dimensions (radii, control heights,
input padding and stroke width) to exact OTUS primitives, for example `--tui-height-m: var(--otus-dimension-44)`.
Component references keep the existing `--tui-*` names. `--tui-lh` remains relative to font line height. Override
primitive values where the theme aliases are declared (for example `:root`); CSS resolves inherited aliases at their
declaration scope.

Documentation / Styles / Typography / Control typography is a separate gallery of 35 live control text samples: buttons,
field values and placeholders, labels, checkbox/radio/switch labels, badges, chips, segmented controls, links, tabs and
data lists. The table reads the rendered font family, weight, size, line height and letter spacing directly from each
sample. The Text styles gallery contains Heading, Body and UI tokens, plus Universita, Universita Italic and Universita
Mono specimens for H1–H6 and Body L–XS. These static faces have weight 400; specimens disable synthetic bold and italic.
The shared font stylesheet registers Universita normal/italic and Universita Mono, exposed through
`--tui-typography-family-universita` and `--tui-typography-family-universita-mono`. Graphik remains the default for text
and headings. Buttons use the existing Body tokens with their component weight (Graphik Medium 500; XS/S: 14/20px, M/L:
16/24px); no separate button typography tokens are defined.

Separate Nx application using Angular 19.2, Nx 22.1.1 and Storybook 10.0.0. Imports resolve to this repository's
`projects/core`, `projects/kit` and `projects/cdk` through the inherited root TypeScript paths. No published Taiga
component copy is used.

Run from the repository root with Node and npm matching `package.json`:

```sh
npm run storybook
```

Open <http://127.0.0.1:6006>. Switch Light/Dark using the preview toolbar. The decorator updates `TUI_DARK_MODE`, so
both the document and portalled dropdowns use the selected theme. In Textfield / With Dropdown, focus the input and
press ArrowDown; select an option or press Escape to close it.

Styles is grouped by subject: Colors (OTUS palette, semantic colors and tokens), Typography (text styles, control
samples and tokens), Layout (breakpoints, sizes and radii), Effects (shadows and motion), Icons and remaining CSS
tokens. Angular DI tokens live in Documentation / Customization. The original palette and typography gallery URLs remain
valid.

The viewport toolbar offers `otus-mobile` (390 × 844) and `otus-desktop` (100% of the available preview canvas width and
height, default). Desktop accounts for the Storybook sidebar, toolbar and addon panel and follows window/panel resizing.
OTUS uses two layouts: mobile below 1024px and desktop from 1024px, aligned across LESS, SCSS and the default
`TUI_MEDIA` token. Legacy Taiga tablet variables remain available for compatibility. The selector resizes the actual
story iframe, including portals, and is independent of school, otus-core/otus-brand and theme. `tui-root` exposes the
selected preset through `data-breakpoint` for future custom tokens and layouts. No new typography or layout overrides
are applied; iOS and Android patterns remain available.

Button, Textfield and Checkbox expose controls for their supported inputs and stories for disabled, focus, validation,
loading, checked and indeterminate states where applicable. Values in the Textfield and Checkbox controls initialize the
reactive forms; changes made in the canvas remain interactive until the corresponding control is changed again.

Overview / Catalog links to 201 pages with 918 interface previews. Navigation is read directly from the demo's
`pages.ts`, `demo-routes.ts` and `app.routes.ts`. Sidebar sections match the website: Documentation / Styles and
Customization, Components, Form, Layout, Navigation, Charts and Tools, including their original subgroups.

Numbered examples load the original standalone components on demand. API Preview stories retain the demo's live
controls, template references, state and component styles. Generated API components extract the complete API tab while
omitting documentation-only source imports. The generator adds explicit zero-argument constructors to Array-based pages
for Angular JIT compatibility. Typography, Colors and Shadows also include the original visual galleries. Pages with no
interface preview or no implemented route are omitted.

Documentation / Styles / Tokens provides searchable color, gradient, typography, dimension, shadow, motion, CSS
variable, injection token and icon references. Values and samples follow Light/Dark mode. Tokens not defined in the
current theme are marked. Icons are paginated in groups of 100. Button, Textfield and Checkbox retain their existing
Controls stories inside the corresponding website groups; their story identifiers remain stable.

The preview supplies the demo platform, syntax highlighting, custom portal host and routable dialog routes. The iframe
has a fixed base URL pointing to the hosting root so lazy imports keep working after Angular changes the iframe's URL.
Demo images and SVGs are served locally. Graphik and the repository's customized palette and textfield styles apply
throughout the previews.

Serve and build regenerate the catalog automatically. To update the running development server after adding a new demo
example or token, run:

```sh
npx nx run storybook:generate-catalog
```

Edit demo sources and `projects/storybook/scripts/generate-catalog.mjs`, rather than files in `src/generated`.
Regeneration preserves unchanged files to avoid interrupting the running preview. Generated `src/component-styles.less`
includes every version-scoped inline style import from the library.

The preview uses `TuiRoot`, `provideTaiga`, zoneless change detection and HTTP providers as in the demo. The global LESS
entry includes the repository theme, fonts and component styles. Angular's Webpack compiler leaves interpolated inline
styles containing `TUI_VERSION` unprocessed, so those styles are compiled globally under the same `data-tui-version`
scope. SVG assets come from `projects/icons/src`; Nx prepares them before serving or building.

```sh
npm run build:storybook
# Static output: dist/storybook

# With Storybook running and Google Chrome installed:
npx nx run storybook:test-storybook
```

Browser checks use the workspace's existing Playwright installation. They cover every indexed story, root/style
integration, controls, theme switching, text entry/clearing, checkbox interaction, dropdown selection in both themes,
catalog links/search, token values and icon pagination. Catalog tests are split by demo section. To run in parallel:

```sh
npx playwright test --config projects/storybook/playwright.config.ts --workers 4
```

Set `STORYBOOK_URL` to check a served static build instead of the development server.

## Experimental OTUS tabs

`Navigation / Tabs / OTUS experimental` compares an opt-in Figma style with the original Taiga tabs. Use the existing
school, theme and `otus-core` / `otus-brand` toolbar controls; the on-page API table switches all examples between
regular and compact tabs through the existing `[size]` selector. The design reference is `yJH0kLE9Wh0OCD1LRaa9I0`, nodes
`1935:5320`, `320:527`, `7592:4130` and `324:164`.

The example composes `TuiTabs`, `TuiAppearance` and the explicitly imported `TuiOtusTab`. Put `tuiOtusTabs` on the
horizontal `tui-tabs` and bind its existing `[underline]` input to the selected appearance's background CSS variable.
Put `tuiTab` and `tuiOtusTab` on each button. The native underline becomes a full-height rounded background, retaining
Taiga's width/position transition. Horizontal indicators use Taiga's existing numeric position/width measurements in
every browser, including the native underline, the filled style and TabsWithMore. Switching CSS anchors does not
reliably interpolate used geometry. Vertical tabs measure the active item for a single moving indicator, transitioning
its top and height and updating on container resize. Bind `tuiAppearance` to the selected `primary` or `accent`
appearance for the active tab and `outline-grayscale` for the others using the existing `activeItemIndex`. The
`[appearance]` API selector updates all OTUS examples and preserves selection. The opt-in directive reuses
`TuiButtonMotion` and `TUI_BUTTON_MOTION`; it adds no selection or keyboard logic.

Regular tabs are 48px high with 18px inline padding; compact tabs and viewports below 1024px use 40px height, 12px
inline padding and 12/18px text. Both use 8px radii and 4px gaps. Figma's mobile tabline instance still references
desktop tabs; the experiment follows the separate mobile tab component for compact dimensions. Colors use the existing
school aliases rather than copying the reference's purple into the theme. Tabs without these opt-in attributes keep
their existing styles. This experiment covers horizontal tabs; mobile TabBar is a separate component.

The same page includes bottom-floating tabs from Bachelor node `855:10437` in `pqX3ssUw5Loo1xEko2caQG`. They compose the
existing `TuiButtonGroup` with `tuiAppearance="floating"`, `TuiFloatingContainer` and the same opt-in tabs. The group
uses 8px padding and a 16px radius; the native floating appearance supplies its theme surface and shadow. Page-local
layout overrides adapt ButtonGroup's vertical action layout to the horizontal tabline. Selection, keyboard navigation,
horizontal scrolling, size, Primary/Accent and Core/Brand motion reuse the existing mechanisms.

### Floating tabs entrance

The experiment's “Повторить появление” button replays the entrance without recreating the tabs or resetting selection.
The supplied `selector.json` Lottie reference uses 100 fps: upward motion at frames 10–90, seed/circle growth at 30–70,
horizontal expansion at 90–150, and label opacity at 120–150. The preview uses the JSON curves with a sequential
entrance: rise for the first 40%, grow the circle from 40–60%, then unfold from 65–100%, with labels appearing near the
end. It stops at the expanded panel; the reference's later exit is not played.

Native `tuiFloatingContainer`, ButtonGroup, colors, typography, size and productive entrance curve remain in use.
Missing entrance parameters are theme tokens: `--otus-floating-enter-duration` (five native duration units),
`--otus-floating-enter-offset`, `--otus-floating-enter-seed` and `--otus-curve-floating-spring` (the reference's 0.34,
1.36, 0.64, 1 curve). Circle geometry follows the tab size and the existing mobile breakpoint. Each replay measures the
visual viewport bottom and the panel's resting position, subtracting any in-progress translation, so the full panel
starts below the viewport. The native container's automatic slide is disabled in this experiment to avoid moving that
destination. The floating background stays native throughout; the parent reuses the native small shadow while masks are
active. Circle growth uses the bounded productive entrance curve; only travel and horizontal expansion use the
reference's spring curve, keeping the ball inside its paint bounds. The selected fill is masked separately to preserve
the circular inset before unfolding, while only labels fade in late. Reduced motion skips the entrance. Tabs are
temporarily inert during the reveal and become interactive when it completes.

## Experimental navigation

`Navigation / Otus experiment` contains a configurable playground and five presets: public site, applicant, student,
employee, and services/tools with a sidebar. Open `/story/navigation-otus-experiment--playground` to change zone,
layout, button size, search, notifications and language on the page. Theme switching lives in the avatar menu.
Unsupported actions are disabled in settings. Storybook Docs exposes the same inputs plus optional `configuration`
(menus, utilities, bookmarks) and `toolGroups` (grouped tool destinations) for custom compositions. The previous student
story URL redirects to `/story/navigation-otus-experiment--student`, preserving theme and school parameters.

The header composes native `TuiButton`, `TuiDropdown`, `TuiTextfield`/`TuiInput`, `TuiAvatar`, `TuiBadgeNotification`
and `TuiTitle`. Source references describe structure and behavior, while buttons retain the current Taiga appearances,
typography, padding, icons and radii. Native dimensions are verified in Chrome: S = 32px, M = 44px, L = 56px. The
default is M. The 80px sticky header keeps its token-based gradient beneath the islands, and content remains six neutral
`TuiSkeleton` squares. Local classes use the `t-otus-navigation` prefix; shared Taiga components and tokens are
unchanged.

Below 1024px every preset uses bottom floating navigation composed from `TuiFloatingContainer`, native buttons and
`TuiAvatar`. Menu and Profile intentionally remain unavailable placeholders without popovers. The public preset shows
the login link instead of Profile. The native floating-container gradient provides contrast over content. Resize the
browser or its device viewport to try the layout; the breakpoint follows the Storybook canvas width.

References:

- Public desktop header: https://cu.ru/ — login link and a visible, unavailable burger.
- Applicant: Figma `yJH0kLE9Wh0OCD1LRaa9I0`, section `7965:7678`, desktop instance `6879:6518`: direct sections, More,
  language, notifications and profile; theme switching is placed in the avatar menu.
- Student: Figma `r8stDCVaU8oR9yflSTl9GR`, node `1904:8579`: existing navigator/study/events/services composition.
- Tools: Figma `a1mIW2dzvDAcWo4jk24DgW`, node `811:15409`: grouped service navigation. It reuses `TuiNavigationAside`,
  `TuiAsideGroup`, `TuiAsideItem` and `TuiChevron` for expand/collapse, nested groups and icon-rail behavior. The
  supported local theme attribute and `--tui-theme-color` keep its surface synchronized with light/dark mode.
- Mobile structure for all presets: Figma `7dn5HSS54i2uX4yQ13AQjS`, node `314:2286`, navigation `314:2624`.

Employee destinations and mega-menu contents are examples, not a product permissions model. Choosing a destination
updates the selected section; no backend requests or product routes are simulated. Every trigger owns its dropdown
context; native Dropdown handles click toggling, outside dismissal, Escape and focus return. Search supports Cmd/Ctrl+K
only when available. Changing configuration clears unavailable popup state. The avatar menu offers light/dark theme
switching and closes after selection. Local theme switching stays inside the example; global school, direction and theme
controls remain supported.

## OTUS color mapping

The library theme uses three layers: global primitives (`--otus-color-*`) → OTUS semantic roles (`--otus-*`) → Taiga
aliases (`--tui-*`). Each TUI color role has an OTUS counterpart, including interaction states and role aliases.
Components keep their existing `--tui-*` references. Color mapping is shared by `otus-core` and `otus-brand`.

The source palette is `projects/styles/tokens/otus-global-colors.json`. The rules and contrast calculations live in
`projects/styles/scripts/otus-color-mapping.mjs` and `otus-color-contrast.mjs`. The generator
`projects/styles/scripts/generate-otus-colors.mjs` creates the shipped LESS aliases and runs before the styles build and
Storybook catalog generation. Figma communication guides provide context only; their colors are not imported.

Use the shared `@taiga-ui/styles/taiga-ui-theme.less` entry point, or `.taiga-ui-theme()` for scoped applications. Put
the selected school and explicit theme on the same theme boundary, including nested theme boundaries:

```html
<tui-root
  data-brand="otus-design"
  tuiTheme="dark"
>
  ...
</tui-root>
```

Schools: `otus-university`, `otus-tech`, `otus-design`, `otus-nature`. Without a school on the container or any
ancestor, the default is `otus-university`. Taiga's light/dark theme mechanism remains in place. Popups inside
`tui-root` inherit the same aliases. Storybook binds its school and theme toolbar selections on that root.

`Documentation / Styles / Colors / Color mapping` shows one chain per row: global primitive → OTUS semantic token → TUI
alias. The selected Storybook school/theme defines the default view. Search accepts either namespace, primitive paths
and hex values. Open a row's inline palette to edit it without leaving the mapping; “Связи и школы” exposes comparisons,
alias expressions and reasons. Linked roles jump to their source token. The complete contrast report and instructions
follow the table. JSON export, drafts and runtime previews share the library generator.

The original Taiga mapping story ID is retained. Links to the former OTUS-only page redirect to the unified page,
including iframe links, query parameters and deployment subpaths. Override OTUS roles at the same boundary where TUI
aliases are declared; inherited aliases are not recomputed in descendants.

The manifest has `appliedToRuntime: true`; filters never limit the export. It includes primitive values, TUI aliases,
source paths, the checked-negative contextual override and the measured contrast report. The 360 listed
appearance/theme/school/state combinations meet 4.5:1, including alpha compositing on background-base. This is not a
full conformance audit: filters (primary-destructive), custom/image backgrounds, focus and non-text contrast are
excluded. Changing palette or mappings requires regeneration and rerunning these checks.

### Editing the color mapping

The color mapping table lets you choose any existing OTUS primitive for a token, school and theme. The original alpha is
preserved. TUI → TUI aliases remain linked; edit their source token instead. The checked-negative context override
remains separate and is included in the contrast report.

Edits are a browser-local draft shared with other Storybook examples on the same origin. You can disable live preview
without losing the draft, reset one cell or reset all edits. Contrast is recalculated for the existing report recipes;
hover/pressed direction and chart distinguishability still need a separate check. Source files are never written by the
browser. JSON export includes every school/theme and `configuration.overrides` when there are edits.

To apply the downloaded draft to the shared library, run from the repository root:

```sh
node projects/styles/scripts/import-otus-color-mapping.mjs /path/to/otus-taiga-color-mapping.json
```

This validates references against the existing palette, writes `projects/styles/tokens/otus-color-overrides.json` and
regenerates the shared LESS aliases. Rebuild Storybook and the library afterward. To restore the library defaults, use
`{"schemaVersion": 1, "overrides": []}` in that configuration file and regenerate colors. After importing a draft, reset
the browser-local draft so the table shows the new library values.
