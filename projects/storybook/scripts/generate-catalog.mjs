import {mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {format, resolveConfig} from 'prettier';
import {storyNameFromExport, toId} from 'storybook/internal/csf';
import ts from 'typescript';

import {readNavigation} from './catalog-navigation.mjs';
import {pagePreviews, previewSource} from './page-previews.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const storyRoot = path.join(root, 'projects/storybook/src');
const generatedRoot = path.join(storyRoot, 'generated');
const pagesRoot = path.join(root, 'projects/demo/src/pages');
const generatedFiles = new Set();
const quote = (value) => JSON.stringify(value);

async function files(directory) {
    const entries = await readdir(directory, {withFileTypes: true});
    const nested = await Promise.all(
        entries.map((entry) => {
            const filename = path.join(directory, entry.name);

            return entry.isDirectory() ? files(filename) : [filename];
        }),
    );

    return nested.flat().sort();
}

async function readOptional(filename) {
    try {
        return await readFile(filename, 'utf8');
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }

        return '';
    }
}

async function writeGenerated(filename, contents) {
    const formatting = await resolveConfig(filename);
    const formatted = await format(contents, {...formatting, filepath: filename});

    generatedFiles.add(filename);

    if ((await readOptional(filename)) !== formatted) {
        await writeFile(filename, formatted);
    }
}

function exampleNames(source) {
    const node = ts.createSourceFile('index.ts', source, ts.ScriptTarget.Latest, true);
    let names = [];

    function visit(child) {
        if (
            ts.isPropertyDeclaration(child) &&
            child.name.getText(node) === 'examples' &&
            child.initializer &&
            ts.isArrayLiteralExpression(child.initializer)
        ) {
            names = child.initializer.elements.map((element) => (ts.isStringLiteral(element) ? element.text : ''));
        }

        ts.forEachChild(child, visit);
    }

    visit(node);

    return names;
}

await mkdir(generatedRoot, {recursive: true});

const previousFiles = await files(generatedRoot);

const examples = (await files(pagesRoot)).filter((filename) => /\/(?:examples\/)?\d+\/index\.ts$/.test(filename));
const groups = new Map();

for (const filename of examples) {
    const group = filename.replace(/\/(?:examples\/)?\d+\/index\.ts$/, '');
    const entries = groups.get(group) ?? [];

    entries.push(filename);
    groups.set(group, entries);
}

const navigation = await readNavigation(root);
const catalog = [];
let previewCount = 0;

for (const page of navigation.filter((page) => page.directory)) {
    const group = page.directory;
    const relative = path.relative(pagesRoot, group);
    const template = await readOptional(path.join(group, 'index.html'));
    const source = await readOptional(path.join(group, 'index.ts'));
    const title = page.path.join('/');
    const names = exampleNames(source);
    const definitions = [];
    const previewDefinitions = pagePreviews(template, page);
    const entries = groups.get(group) ?? [];

    entries.sort((a, b) => Number(path.basename(path.dirname(a))) - Number(path.basename(path.dirname(b))));

    for (const preview of previewDefinitions) {
        const stem = `${relative.replaceAll(path.sep, '-')}-${preview.exportName.toLowerCase()}`;
        const componentFile = path.join(generatedRoot, `${stem}.component.ts`);
        const htmlFile = path.join(generatedRoot, `${stem}.component.html`);

        await writeGenerated(
            componentFile,
            previewSource(source, path.join(group, 'index.ts'), componentFile, htmlFile),
        );
        await writeGenerated(htmlFile, preview.template);
        definitions.push({
            name: preview.name,
            exportName: preview.exportName,
            importPath: `./${stem}.component`,
            html: preview.template,
            source: path.relative(root, path.join(group, 'index.ts')),
            kind: preview.exportName === 'ApiPreview' ? 'api' : 'gallery',
        });
    }

    for (const filename of entries) {
        const number = Number(path.basename(path.dirname(filename)));

        definitions.push({
            name: names[number - 1] || `Example ${number}`,
            exportName: `Example${number}`,
            importPath: path.relative(generatedRoot, filename).replace(/\.ts$/, ''),
            html: await readOptional(filename.replace(/\.ts$/, '.html')),
            source: path.relative(root, filename),
            kind: 'example',
        });
    }

    if (!definitions.length) {
        continue;
    }

    const stories = definitions.map(
        (definition) => `export const ${definition.exportName}: Story = {
    name: ${quote(definition.name)},
    loaders: [async () => ({example: (await import(${quote(definition.importPath)})).default})],
    parameters: {
        catalog: {source: ${quote(definition.source)}, kind: ${quote(definition.kind)}, route: ${quote(page.route)}},
        docs: {source: {code: ${quote(definition.html)}, language: 'html'}},
    },
};`,
    );

    const contents = `// Generated by projects/storybook/scripts/generate-catalog.mjs. Edit the demo sources instead.
import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiExampleStory} from '../example/example.component';

const meta = {
    title: ${quote(title)},
    component: TuiExampleStory,
    parameters: {controls: {disable: true}},
    render: (args, {loaded}) => ({props: {...args, example: loaded['example']}}),
} satisfies Meta<TuiExampleStory>;

export default meta;

type Story = StoryObj<TuiExampleStory>;

${stories.join('\n\n')}
`;

    await writeGenerated(path.join(generatedRoot, `${relative.replaceAll(path.sep, '-')}.stories.ts`), contents);
    catalog.push({
        title,
        examples: definitions.length,
        source: path.relative(root, group),
        storyId: toId(title, storyNameFromExport(definitions[0].exportName)),
        route: page.route,
        stories: definitions.map((definition) => ({
            id: toId(title, storyNameFromExport(definition.exportName)),
            kind: definition.kind,
            name: definition.name,
        })),
    });
    previewCount += definitions.length;
}

const imports = new Set();
const libraries = [
    'core',
    'kit',
    'layout',
    'addon-charts',
    'addon-commerce',
    'addon-mobile',
    'addon-table',
    'experimental',
    'legacy',
];

for (const library of libraries) {
    for (const filename of (await files(path.join(root, 'projects', library))).filter((file) => file.endsWith('.ts'))) {
        const source = await readFile(filename, 'utf8');

        for (const style of source.matchAll(/styles:\s*`([\s\S]*?)`/g)) {
            if (!style[1].includes('${TUI_VERSION}')) {
                continue;
            }

            for (const match of style[1].matchAll(/@import\s+['"]([^'"]+)['"]/g)) {
                const target = match[1].startsWith('.')
                    ? path.relative(storyRoot, path.resolve(path.dirname(filename), match[1]))
                    : match[1];

                imports.add(target);
            }
        }
    }
}

await writeGenerated(
    path.join(storyRoot, 'component-styles.less'),
    `// Generated from version-scoped component styles by scripts/generate-catalog.mjs.
[data-tui-version] {
${[...imports]
    .sort()
    .map((target) => `    @import '${target}';`)
    .join('\n')}
}
`,
);

const tokenSources = [
    ...(await files(path.join(root, 'projects/styles/mixins/theme'))),
    ...(await files(path.join(root, 'node_modules/@taiga-ui/design-tokens/palette'))).filter((file) =>
        file.endsWith('.css'),
    ),
];
const tokens = new Set();

for (const filename of tokenSources) {
    const source = await readFile(filename, 'utf8');

    for (const match of source.matchAll(/(--(?:tui|otus)-[\w-]+)\s*:/g)) {
        tokens.add(match[1]);
    }
}

function injectionTokenNames(declaration, node) {
    if (
        !declaration.initializer ||
        !/^(?:new InjectionToken|tuiCreateToken|tuiCreateOptions)/.test(declaration.initializer.getText(node))
    ) {
        return [];
    }

    const names = ts.isArrayBindingPattern(declaration.name)
        ? declaration.name.elements.filter(ts.isBindingElement).map((element) => element.name.getText(node))
        : [declaration.name.getText(node)];

    return names.filter((name) => name.startsWith('TUI_'));
}

function moduleTokens(source, library, filename) {
    const node = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
    const tokens = [];

    for (const statement of node.statements) {
        if (
            !ts.isVariableStatement(statement) ||
            !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
        ) {
            continue;
        }

        for (const declaration of statement.declarationList.declarations) {
            for (const name of injectionTokenNames(declaration, node)) {
                tokens.push({name, package: library, source: path.relative(root, filename)});
            }
        }
    }

    return tokens;
}

const injectionTokens = [];

for (const library of ['cdk', ...libraries, 'i18n']) {
    for (const filename of (await files(path.join(root, 'projects', library))).filter(
        (file) => file.endsWith('.ts') && !/\.(?:spec|test)\.ts$/.test(file),
    )) {
        const source = await readFile(filename, 'utf8');

        injectionTokens.push(...moduleTokens(source, library, filename));
    }
}

const iconsRoot = path.join(root, 'projects/icons/src');
const icons = (await files(iconsRoot))
    .filter((filename) => filename.endsWith('.svg'))
    .map((filename) =>
        path
            .relative(iconsRoot, filename)
            .replace(/\.svg$/, '')
            .replaceAll(path.sep, '.'),
    );

await writeGenerated(
    path.join(generatedRoot, 'catalog.ts'),
    `// Generated by scripts/generate-catalog.mjs.
export const CATALOG = ${JSON.stringify(catalog, null, 4)} as const;

export const STYLE_TOKENS = ${JSON.stringify([...tokens].sort(), null, 4)} as const;

export const INJECTION_TOKENS = ${JSON.stringify(
        injectionTokens.sort((a, b) => a.name.localeCompare(b.name)),
        null,
        4,
    )} as const;

export const ICON_NAMES = ${JSON.stringify(icons, null, 4)} as const;
`,
);

for (const filename of previousFiles.filter((file) => !generatedFiles.has(file))) {
    await rm(filename);
}

process.stdout.write(
    `Generated ${previewCount} previews in ${catalog.length} navigation pages, ${imports.size} component style imports, ${tokens.size} CSS tokens and ${injectionTokens.length} injection tokens and ${icons.length} icons.\n`,
);
