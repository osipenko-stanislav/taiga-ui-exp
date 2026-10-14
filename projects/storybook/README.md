# Taiga UI Storybook

Published: <https://osipenko-stanislav.github.io/taiga-ui-exp/>.

GitHub Pages rebuilds from `experiments/colors` and `main` using `storybook-pages.yml`. To build the same project path
locally, run `STORYBOOK_BASE_HREF=/taiga-ui-exp/ npm run build:storybook`.

OTUS icon resolution and `otus-core` button motion are library defaults. The Storybook toolbar overrides the motion
signal only to demonstrate `otus-brand`; applications can provide `TUI_BUTTON_MOTION` with their own signal to switch
these modes. Colors, fonts, typography, tracking, stroke and motion styles live in the shared library sources.

Documentation / Styles / Control Typography is a separate gallery of 35 live control text samples: buttons, field values
and placeholders, labels, checkbox/radio/switch labels, badges, chips, segmented controls, links, tabs and data lists.
The table reads the rendered font family, weight, size, line height and letter spacing directly from each sample. The
original Typography gallery contains only Heading, Body and UI tokens. Buttons use the existing Body tokens with their
component weight (Graphik Medium 500; XS/S: 14/20px, M/L: 16/24px); no separate button typography tokens are defined.

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

The viewport toolbar offers `otus-mobile` (390 × 844), `otus-tablet` (768 × 1024) and `otus-desktop` (1280 × 720,
default). These widths follow the LESS breakpoints: mobile below 768px, tablet from 768px to below 1024px, desktop from
1024px. The selector resizes the actual story iframe, including portals, and is independent of school,
otus-core/otus-brand and theme. `tui-root` exposes the selected preset through `data-breakpoint` for future custom
tokens and layouts. No new typography or layout overrides are applied; iOS and Android patterns remain available.

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
