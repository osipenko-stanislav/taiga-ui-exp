import assert from 'node:assert/strict';
import {test} from 'node:test';

import ts from 'typescript';

import {pagePreviews, previewSource} from './page-previews.mjs';

test('typography gallery includes named typeface tabs without template wrappers', () => {
    const template =
        '<tui-doc-page>@for (tab of tabs; track tab) {<ng-template [pageTab]="tab"><p>Graphik</p></ng-template>}<ng-template pageTab="Universita"><p>Universita</p></ng-template></tui-doc-page>';
    const [gallery] = pagePreviews(template, {directory: '/demo/typography', route: '/typography'});

    assert.ok(gallery.template.includes('<p>Graphik</p>'));
    assert.ok(gallery.template.includes('<p>Universita</p>'));
    assert.ok(!gallery.template.includes('ng-template'));
});

test('Array-based API pages declare a zero-argument constructor for Angular JIT', () => {
    const source = previewSource(
        "export default class Page extends Array { protected value = 'Button'; }",
        '/project/demo/index.ts',
        '/project/stories/button.component.ts',
        '/project/stories/button.component.html',
    );
    const parsed = ts.createSourceFile('button.component.ts', source, ts.ScriptTarget.Latest, true);
    const page = parsed.statements.find(ts.isClassDeclaration);
    const constructor = page.members.find(ts.isConstructorDeclaration);

    assert.ok(constructor);
    assert.equal(constructor.parameters.length, 0);
    assert.match(constructor.getText(parsed), /super\(\)/);
});

test('preview extraction retains API controls and template references', () => {
    const template =
        '<tui-doc-page><ng-template pageTab><p>Documentation</p></ng-template><ng-template pageTab><tui-doc-demo><button [disabled]="control.disabled">Button</button></tui-doc-demo><div #control>Controls</div></ng-template></tui-doc-page>';
    const previews = pagePreviews(template, {directory: '/demo/button', route: '/components/button'});

    assert.equal(previews.length, 1);
    assert.ok(previews[0].template.includes('#control'));
    assert.ok(!previews[0].template.includes('Documentation'));
});
