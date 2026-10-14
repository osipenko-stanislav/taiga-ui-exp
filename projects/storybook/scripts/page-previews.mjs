import path from 'node:path';

import {parseTemplate} from '@angular/compiler';
import ts from 'typescript';

function tabContents(template, node) {
    return template.slice(node.startSourceSpan.end.offset, node.endSourceSpan.start.offset);
}

export function pagePreviews(template, page) {
    const parsed = parseTemplate(template, 'index.html', {preserveWhitespaces: true});

    if (parsed.errors?.length) {
        throw new Error(`Cannot parse ${page.directory}: ${parsed.errors.join('\n')}`);
    }

    const previews = [];

    function visit(node) {
        if (
            node.tagName === 'ng-template' &&
            node.endSourceSpan &&
            node.attributes?.some((attribute) => attribute.name === 'pageTab')
        ) {
            const contents = tabContents(template, node);

            if (contents.includes('<tui-doc-demo')) {
                previews.push({name: 'API Preview', exportName: 'ApiPreview', template: contents});
            }
        }

        for (const child of node.children ?? []) {
            visit(child);
        }
    }

    for (const node of parsed.nodes) {
        visit(node);
    }

    if (page.route === '/colors') {
        const container = parsed.nodes.find((node) => node.name === 'tui-doc-page');

        for (const tab of container.children.filter((node) => node.tagName === 'ng-template')) {
            const name = tab.attributes.find((attribute) => attribute.name === 'pageTab')?.value;

            if (name && name !== 'Setup') {
                previews.push({name, exportName: name, template: tabContents(template, tab)});
            }
        }
    }

    if (['/shadows', '/typography'].includes(page.route)) {
        const container = parsed.nodes.find((node) => node.name === 'tui-doc-page');
        const contents = tabContents(template, container)
            .replaceAll(/<ng-template\s+\[pageTab\]="tab"\s*>/g, '')
            .replaceAll('</ng-template>', '');

        previews.push({name: 'Gallery', exportName: 'Gallery', template: contents});
    }

    return previews;
}

function hasDocumentationImport(node) {
    let found = false;

    function visit(child) {
        if (ts.isCallExpression(child) && child.expression.kind === ts.SyntaxKind.ImportKeyword) {
            const argument = child.arguments[0];

            found ||= ts.isStringLiteral(argument) && /(?:\.(?:md|html|less)|\?raw)$/.test(argument.text);
        }

        ts.forEachChild(child, visit);
    }

    visit(node);

    return found;
}

export function previewSource(source, originalFile, generatedFile, htmlFile) {
    const node = ts.createSourceFile(originalFile, source, ts.ScriptTarget.Latest, true);
    const relative = (filename) => {
        const target = path.relative(path.dirname(generatedFile), filename).replaceAll(path.sep, '/');

        return target.startsWith('.') ? target : `./${target}`;
    };
    const transformed = ts.transform(node, [
        (context) => {
            function visit(child) {
                if (
                    ts.isClassDeclaration(child) &&
                    child.heritageClauses?.some((clause) =>
                        clause.types.some((type) => type.expression.getText(node) === 'Array'),
                    ) &&
                    !child.members.some(ts.isConstructorDeclaration)
                ) {
                    const constructor = ts.factory.createConstructorDeclaration(
                        undefined,
                        [],
                        ts.factory.createBlock(
                            [
                                ts.factory.createExpressionStatement(
                                    ts.factory.createCallExpression(ts.factory.createSuper(), undefined, []),
                                ),
                            ],
                            true,
                        ),
                    );
                    const updated = ts.factory.updateClassDeclaration(
                        child,
                        child.modifiers,
                        child.name,
                        child.typeParameters,
                        child.heritageClauses,
                        [...child.members, constructor],
                    );

                    return ts.visitEachChild(updated, visit, context);
                }

                if (ts.isPropertyDeclaration(child) && child.initializer && hasDocumentationImport(child.initializer)) {
                    return;
                }

                if (ts.isPropertyAssignment(child) && child.name.getText(node) === 'templateUrl') {
                    return ts.factory.updatePropertyAssignment(
                        child,
                        child.name,
                        ts.factory.createStringLiteral(relative(htmlFile)),
                    );
                }

                if (
                    ts.isPropertyAssignment(child) &&
                    child.name.getText(node) === 'styleUrl' &&
                    ts.isStringLiteral(child.initializer)
                ) {
                    return ts.factory.updatePropertyAssignment(
                        child,
                        child.name,
                        ts.factory.createStringLiteral(
                            relative(path.resolve(path.dirname(originalFile), child.initializer.text)),
                        ),
                    );
                }

                if (
                    ts.isImportDeclaration(child) &&
                    ts.isStringLiteral(child.moduleSpecifier) &&
                    child.moduleSpecifier.text.startsWith('.')
                ) {
                    return ts.factory.updateImportDeclaration(
                        child,
                        child.modifiers,
                        child.importClause,
                        ts.factory.createStringLiteral(
                            relative(path.resolve(path.dirname(originalFile), child.moduleSpecifier.text)),
                        ),
                        child.attributes,
                    );
                }

                return ts.visitEachChild(child, visit, context);
            }

            return (file) => ts.visitNode(file, visit);
        },
    ]);

    try {
        return `// Generated from ${originalFile.split('/projects/')[1]}. Edit the demo source instead.\n${ts.createPrinter().printFile(transformed.transformed[0])}`;
    } finally {
        transformed.dispose();
    }
}
