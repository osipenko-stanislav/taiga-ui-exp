import {
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    signal,
} from '@angular/core';
import {TUI_DARK_MODE, TuiButton, TuiIcon} from '@taiga-ui/core';
import {OTUS_ICON_SETS} from '@taiga-ui/icons';

import {CATALOG, ICON_NAMES, INJECTION_TOKENS, STYLE_TOKENS} from '../generated/catalog';

export type TuiFoundationSection =
    | 'colors'
    | 'dimensions'
    | 'icons'
    | 'injection'
    | 'motion'
    | 'other'
    | 'overview'
    | 'shadows'
    | 'typography';

const SECTION_TITLES: Record<TuiFoundationSection, string> = {
    overview: 'Каталог Taiga UI',
    colors: 'Цвета и градиенты',
    typography: 'Типографика · Graphik',
    dimensions: 'Размеры и скругления',
    shadows: 'Тени',
    motion: 'Анимация',
    other: 'Остальные CSS-токены',
    injection: 'Токены внедрения зависимостей',
    icons: 'Иконки',
};

function tokenSection(token: string): TuiFoundationSection {
    if (token.includes('typography')) {
        return 'typography';
    }

    if (token.includes('shadow')) {
        return 'shadows';
    }

    if (
        /duration|animation|curve/.test(token) ||
        token === '--otus-text-roll' ||
        token === '--otus-button-bg'
    ) {
        return 'motion';
    }

    if (/radius|height|padding|stroke|lh/.test(token)) {
        return 'dimensions';
    }

    return /background|text-|border|status|chart|support|service|gradient|selection|autofill/.test(
        token,
    )
        ? 'colors'
        : 'other';
}

@Component({
    selector: 'tui-foundations-story',
    imports: [TuiButton, TuiIcon],
    templateUrl: './foundations.component.html',
    styleUrl: './foundations.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiFoundationsStory {
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly darkMode = inject(TUI_DARK_MODE);
    private readonly values = signal<Readonly<Record<string, string>>>({});
    private readonly selectedTokens = computed(() =>
        STYLE_TOKENS.filter((token) => tokenSection(token) === this.section()),
    );

    protected readonly query = signal('');
    protected readonly iconPage = signal(0);
    protected readonly iconSet = signal<(typeof OTUS_ICON_SETS)[number] | 'all'>('all');
    protected readonly iconSets = OTUS_ICON_SETS;
    protected readonly title = computed(() => SECTION_TITLES[this.section()]);
    protected readonly exampleCount = CATALOG.reduce(
        (sum, group) => sum + group.examples,
        0,
    );

    protected readonly groupCount = CATALOG.length;
    protected readonly cssTokenCount = STYLE_TOKENS.length;
    protected readonly injectionTokenCount = INJECTION_TOKENS.length;
    protected readonly iconCount = ICON_NAMES.length;
    protected readonly filteredIcons = computed(() => {
        const query = this.query().trim().toLowerCase();
        const set = this.iconSet();

        return ICON_NAMES.filter(
            (name) =>
                (set === 'all' || name.startsWith(`${set}.`)) &&
                name.toLowerCase().includes(query),
        );
    });

    protected readonly iconPageCount = computed(() =>
        Math.ceil(this.filteredIcons().length / 100),
    );

    protected readonly icons = computed(() =>
        this.filteredIcons().slice(this.iconPage() * 100, (this.iconPage() + 1) * 100),
    );

    protected readonly catalog = computed(() => {
        const query = this.query().trim().toLowerCase();

        return CATALOG.filter((group) => group.title.toLowerCase().includes(query));
    });

    protected readonly injectionTokens = computed(() => {
        const query = this.query().trim().toLowerCase();

        return INJECTION_TOKENS.filter((token) =>
            `${token.name} ${token.package}`.toLowerCase().includes(query),
        );
    });

    protected readonly tokens = computed(() => {
        const query = this.query().trim().toLowerCase();
        const values = this.values();

        return this.selectedTokens()
            .filter((name) => name.toLowerCase().includes(query))
            .map((name) => ({
                name,
                value: values[name] || 'Не определён в текущей теме',
                available: Boolean(values[name]),
                variable: `var(${name})`,
                typography:
                    name.startsWith('--tui-typography-') && !name.includes('family'),
                radius: name.includes('radius'),
            }))
            .sort(
                (first, second) =>
                    Number(second.available) - Number(first.available) ||
                    first.name.localeCompare(second.name),
            );
    });

    public readonly section = input<TuiFoundationSection>('overview');

    constructor() {
        afterRenderEffect(() => {
            this.darkMode();
            const tokens = this.selectedTokens();
            const styles = getComputedStyle(this.element.nativeElement);

            this.values.set(
                Object.fromEntries(
                    tokens.map((name) => [name, styles.getPropertyValue(name).trim()]),
                ),
            );
        });
    }

    protected setQuery(event: Event): void {
        if (event.target instanceof HTMLInputElement) {
            this.query.set(event.target.value);
            this.iconPage.set(0);
        }
    }

    protected changeIconPage(offset: number): void {
        this.iconPage.update((page) =>
            Math.max(0, Math.min(this.iconPageCount() - 1, page + offset)),
        );
    }

    protected setIconSet(event: Event): void {
        if (event.target instanceof HTMLSelectElement) {
            const value = event.target.value;

            this.iconSet.set(OTUS_ICON_SETS.find((set) => set === value) ?? 'all');
            this.iconPage.set(0);
        }
    }
}
