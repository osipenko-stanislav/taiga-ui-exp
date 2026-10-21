import {DOCUMENT} from '@angular/common';
import {
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    computed,
    type ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';

import {
    type ColorOverride,
    type ColorSchool,
} from '../../../styles/scripts/otus-color-overrides.mjs';
import {OTUS_COLOR_MAPPING} from '../generated/catalog';
import {TuiStorybookRoot} from '../root/root.component';
import {TuiColorMappingEditor} from './color-mapping-editor.service';

@Component({
    selector: 'otus-color-mapping',
    imports: [TuiButton],
    templateUrl: './color-mapping.component.html',
    styleUrl: './color-mapping.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiOtusColorMapping {
    private readonly paletteInput =
        viewChild<ElementRef<HTMLInputElement>>('paletteSearch');

    private readonly doc = inject(DOCUMENT);

    protected readonly root = inject(TuiStorybookRoot);
    protected readonly editor = inject(TuiColorMappingEditor);
    protected readonly editing = signal<ColorOverride | null>(null);
    protected readonly paletteQuery = signal('');
    protected readonly selectedPrimitive = computed(() =>
        OTUS_COLOR_MAPPING.primitives.find(
            (item) => item.path === this.editing()?.primitive,
        ),
    );

    protected readonly palette = computed(() => {
        const query = this.paletteQuery().trim().toLowerCase();

        return OTUS_COLOR_MAPPING.primitives.filter((item) =>
            `${item.path} ${item.value}`.toLowerCase().includes(query),
        );
    });

    protected readonly editingKey = computed(() => {
        const selected = this.editing();

        return selected ? `${selected.token}/${selected.school}/${selected.theme}` : '';
    });

    protected readonly focusEditor = afterRenderEffect(() => {
        this.editingKey();
        const input = this.paletteInput()?.nativeElement;

        input?.focus();
        input?.scrollIntoView({block: 'center'});
    });

    protected readonly query = signal('');
    protected readonly category = signal('all');
    protected readonly auditFailuresOnly = signal(false);
    protected readonly auditReport = computed(() => this.editor.mapping().accessibility);
    protected readonly auditRows = computed(() =>
        this.editor
            .mapping()
            .accessibility.checks.filter(
                (check) =>
                    check.theme === this.root.theme() && check.school === this.school(),
            )
            .filter((check) => !this.auditFailuresOnly() || !check.passes)
            .map((check) => ({...check, ratioLabel: check.ratio.toFixed(2)})),
    );

    protected readonly categories = [
        ...new Set(OTUS_COLOR_MAPPING.mappings.map((row) => row.category)),
    ];

    protected readonly schools = OTUS_COLOR_MAPPING.schoolAssignments;
    protected readonly total = OTUS_COLOR_MAPPING.mappings.length;
    protected readonly school = computed(() => this.root.brand());
    protected readonly rows = computed(() => {
        const theme = this.root.theme();
        const query = this.query().trim().toLowerCase();
        const category = this.category();

        return this.editor
            .mapping()
            .mappings.filter((row) => category === 'all' || category === row.category)
            .map((row) => {
                const variant = row.variants[theme];
                const cells = this.schools.map((school) => {
                    const target = variant.schools[school.id];

                    return {
                        ...target,
                        modified: this.editor
                            .overrides()
                            .some(
                                (entry) =>
                                    entry.token === row.tui &&
                                    entry.school === school.id &&
                                    entry.theme === theme,
                            ),
                        school: school.id,
                        contrasts: this.editor
                            .mapping()
                            .accessibility.checks.filter(
                                (check) =>
                                    check.theme === theme &&
                                    check.school === school.id &&
                                    check.backgroundToken === row.tui,
                            )
                            .map((check) => ({
                                ...check,
                                ratioLabel: check.ratio.toFixed(2),
                            })),
                        swatch:
                            target.opacity === 1
                                ? target.value
                                : `color-mix(in srgb, ${target.value} ${target.opacity * 100}%, transparent)`,
                    };
                });

                return {
                    ...row,
                    current: variant.current,
                    inherited: variant.inheritedFromLight,
                    cells,
                };
            })
            .filter((row) =>
                `${row.tui} ${row.current} ${row.cells.map((cell) => `${cell.primitive} ${cell.value}`).join(' ')}`
                    .toLowerCase()
                    .includes(query),
            );
    });

    protected edit(token: string, school: ColorSchool, primitive: string): void {
        this.paletteQuery.set('');
        this.editing.set({token, school, primitive, theme: this.root.theme()});
    }

    protected choose(primitive: string): void {
        const editing = this.editing();

        if (editing) {
            this.editor.set({...editing, primitive});
            this.editing.set({...editing, primitive});
        }
    }

    protected resetCell(): void {
        const editing = this.editing();

        if (editing) {
            this.editor.reset(editing);
            this.editing.set(null);
        }
    }

    protected download(): void {
        const url = URL.createObjectURL(
            new Blob(
                [
                    JSON.stringify(
                        this.editor.overrides().length
                            ? {
                                  ...OTUS_COLOR_MAPPING,
                                  ...this.editor.mapping(),
                                  appliedToRuntime: false,
                                  webPolicy: {
                                      ...OTUS_COLOR_MAPPING.webPolicy,
                                      primary:
                                          'Editable per school and theme. See mappings and configuration.overrides.',
                                      actions:
                                          'Editable per school and theme. See mappings and configuration.overrides.',
                                  },
                                  baselinePolicy: OTUS_COLOR_MAPPING.webPolicy,
                                  example: {
                                      ...OTUS_COLOR_MAPPING.example,
                                      declarations: Object.fromEntries(
                                          Object.keys(
                                              OTUS_COLOR_MAPPING.example.declarations,
                                          ).map((token) => [
                                              token,
                                              this.editor
                                                  .mapping()
                                                  .mappings.find(
                                                      (row) => row.tui === token,
                                                  )!.variants.light.schools[
                                                  'otus-university'
                                              ].css,
                                          ]),
                                      ),
                                  },
                                  configuration: {
                                      schemaVersion: 1,
                                      overrides: this.editor.overrides(),
                                  },
                                  preview: {
                                      scope: 'local-storybook',
                                      librarySourceUnchanged: true,
                                  },
                              }
                            : OTUS_COLOR_MAPPING,
                        null,
                        2,
                    ),
                ],
                {type: 'application/json'},
            ),
        );

        const link = this.doc.createElement('a');

        link.href = url;
        link.download = 'otus-taiga-color-mapping.json';
        this.doc.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}
