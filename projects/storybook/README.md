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
sample. The Text styles gallery contains only Heading, Body and UI tokens. Buttons use the existing Body tokens with
their component weight (Graphik Medium 500; XS/S: 14/20px, M/L: 16/24px); no separate button typography tokens are
defined.

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

The viewport toolbar offers `otus-mobile` (390 × 844), `otus-tablet` (768 × 1024) and `otus-desktop` (100% of the
available preview canvas width and height, default). Desktop accounts for the Storybook sidebar, toolbar and addon panel
and follows window/panel resizing. The library LESS breakpoints remain: mobile below 768px, tablet from 768px to below
1024px, desktop from 1024px. The selector resizes the actual story iframe, including portals, and is independent of
school, otus-core/otus-brand and theme. `tui-root` exposes the selected preset through `data-breakpoint` for future
custom tokens and layouts. No new typography or layout overrides are applied; iOS and Android patterns remain available.

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

## OTUS color mapping

The library theme maps the existing TUI semantic colors to OTUS primitives. Components keep their existing `--tui-*`
references. Color mapping is shared by `otus-core` and `otus-brand`.

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

`Documentation / Styles / Colors / Taiga to Otus mapping` and its JSON download use the same generator as the library.
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
