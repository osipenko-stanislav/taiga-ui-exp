import {readFile} from 'node:fs/promises';
import path from 'node:path';

import ts from 'typescript';

export const NAVIGATION_SECTIONS = ['Documentation', 'Components', 'Form', 'Layout', 'Navigation', 'Charts', 'Tools'];

function property(node, name) {
    return node.properties.find((entry) => ts.isPropertyAssignment(entry) && entry.name.getText() === name)
        ?.initializer;
}

function arrayDeclaration(source, name) {
    for (const statement of source.statements.filter(ts.isVariableStatement)) {
        const declaration = statement.declarationList.declarations.find((entry) => entry.name.getText(source) === name);

        if (declaration) {
            return ts.isAsExpression(declaration.initializer)
                ? declaration.initializer.expression
                : declaration.initializer;
        }
    }

    throw new Error(`Missing navigation declaration: ${name}`);
}

function stringValue(node, routes) {
    if (!node) {
        return '';
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        return node.text;
    }

    return ts.isPropertyAccessExpression(node) ? (routes.get(node.name.text) ?? '') : '';
}

export async function readNavigation(root) {
    const appRoot = path.join(root, 'projects/demo/src/pages/app');
    const routeSource = ts.createSourceFile(
        'demo-routes.ts',
        await readFile(path.join(appRoot, 'demo-routes.ts'), 'utf8'),
        ts.ScriptTarget.Latest,
        true,
    );
    const routes = new Map(
        arrayDeclaration(routeSource, 'DemoRoute').properties.map((entry) => [
            entry.name.getText(routeSource),
            entry.initializer.text,
        ]),
    );
    const source = ts.createSourceFile(
        'pages.ts',
        await readFile(path.join(appRoot, 'pages.ts'), 'utf8'),
        ts.ScriptTarget.Latest,
        true,
    );
    const entries = [];

    for (const page of arrayDeclaration(source, 'pages').elements) {
        const section = stringValue(property(page, 'section'), routes);
        const title = stringValue(property(page, 'title'), routes);

        if (
            !NAVIGATION_SECTIONS.includes(section) ||
            (section === 'Documentation' && !['Customization', 'Styles'].includes(title))
        ) {
            continue;
        }

        const children = property(page, 'subPages');

        if (children) {
            for (const child of children.elements) {
                entries.push({
                    path: [section, title, stringValue(property(child, 'title'), routes)],
                    route: stringValue(property(child, 'route'), routes),
                });
            }
        } else {
            entries.push({path: [section, title], route: stringValue(property(page, 'route'), routes)});
        }
    }

    const routeConfig = ts.createSourceFile(
        'app.routes.ts',
        await readFile(path.join(appRoot, 'app.routes.ts'), 'utf8'),
        ts.ScriptTarget.Latest,
        true,
    );
    const directories = new Map();

    function visit(node) {
        if (ts.isObjectLiteralExpression(node)) {
            const route = stringValue(property(node, 'path'), routes);
            const loader = property(node, 'loadComponent') ?? property(node, 'loadChildren');
            const module = loader?.getText(routeConfig).match(/import\(['"]([^'"]+)/)?.[1];

            if (route && module) {
                directories.set(route, path.resolve(appRoot, module.replace(/\/routes$/, '')));
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(routeConfig);

    return entries.map((entry) => ({...entry, directory: directories.get(entry.route)}));
}
