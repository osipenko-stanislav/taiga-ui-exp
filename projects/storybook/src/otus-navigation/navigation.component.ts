import {NgTemplateOutlet} from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    type ElementRef,
    inject,
    INJECTOR,
    input,
    model,
    signal,
    viewChild,
    viewChildren,
    ViewEncapsulation,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TuiDocAPI, TuiDocAPIItem} from '@taiga-ui/addon-doc';
import {
    TUI_BREAKPOINT,
    TUI_DARK_MODE,
    TuiButton,
    TuiDropdown,
    TuiInput,
    TuiTextfield,
    TuiTitle,
} from '@taiga-ui/core';
import {TuiAvatar, TuiBadgeNotification, TuiSkeleton, TuiSwitch} from '@taiga-ui/kit';

import {TuiOtusMobileNavigation} from './mobile-navigation.component';
import {
    BOOKMARKS,
    NAVIGATION_PRESETS,
    TOOL_GROUPS,
    type TuiOtusNavigationPreset,
    type TuiOtusNavigationSize,
    type TuiOtusNavigationZone,
} from './navigation.data';
import {TuiOtusToolsNavigation} from './tools-navigation.component';

@Component({
    selector: 'otus-navigation-story',
    imports: [
        FormsModule,
        NgTemplateOutlet,
        TuiAvatar,
        TuiBadgeNotification,
        TuiButton,
        TuiDocAPI,
        TuiDocAPIItem,
        TuiDropdown,
        TuiInput,
        TuiOtusMobileNavigation,
        TuiOtusToolsNavigation,
        TuiSkeleton,
        TuiSwitch,
        TuiTextfield,
        TuiTitle,
    ],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.less',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.tuiTheme]': 'currentTheme()',
        '(document:keydown)': 'onShortcut($event)',
    },
})
export class TuiOtusNavigationStory {
    private readonly injector = inject(INJECTOR);
    private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
    private readonly utilityTriggers =
        viewChildren<ElementRef<HTMLButtonElement>>('utilityTrigger');

    private readonly viewportBreakpoint = inject(TUI_BREAKPOINT);
    private readonly darkMode = inject(TUI_DARK_MODE);

    protected readonly isMobile = computed(() => this.viewportBreakpoint() === 'mobile');
    protected readonly mobileMenus = computed(() =>
        this.layout() === 'sidebar'
            ? this.toolGroups().map((group) => ({
                  id: group.id,
                  title: group.title,
                  icon: group.icon,
                  groups: group.items.length
                      ? [
                            {
                                title: group.title,
                                links: group.items.map((title) => ({
                                    title,
                                    description: '',
                                    icon: group.icon,
                                })),
                            },
                        ]
                      : [],
              }))
            : this.navigation(),
    );

    protected readonly themeOverride = signal<'dark' | 'light' | null>(null);
    protected readonly currentTheme = computed(
        () => this.themeOverride() ?? (this.darkMode() ? 'dark' : 'light'),
    );

    protected readonly language = signal('Рус');
    protected readonly bookmarks = BOOKMARKS;
    protected readonly preset = computed<TuiOtusNavigationPreset>(
        () => this.configuration() ?? NAVIGATION_PRESETS[this.zone()],
    );

    protected readonly navigation = computed(() => this.preset().menus);
    protected readonly utilities = computed(() =>
        this.preset().utilities.filter(
            (menu) =>
                (menu.id !== 'search' || this.showSearch()) &&
                (menu.id !== 'notifications' || this.showNotifications()) &&
                (menu.id !== 'language' || this.showLanguage()),
        ),
    );

    protected readonly utilityIds = computed(
        () =>
            new Set([
                ...this.preset().utilities.map(({id}) => id),
                ...(this.isMobile() ? ['search'] : []),
            ]),
    );

    protected readonly opened = signal<string | null>(null);
    protected readonly selected = signal('navigator');
    protected readonly query = signal('');
    protected readonly searchResults = computed(() => {
        const query = this.query().trim().toLocaleLowerCase('ru');

        return this.navigation().flatMap((menu) =>
            menu.groups.flatMap((group) =>
                group.links
                    .filter((link) =>
                        `${link.title} ${link.description}`
                            .toLocaleLowerCase('ru')
                            .includes(query),
                    )
                    .map((link) => ({...link, section: menu.id})),
            ),
        );
    });

    protected readonly placeholders = [0, 1, 2, 3, 4, 5];

    protected readonly closeUnavailable = effect(() => {
        const opened = this.opened();
        const available =
            this.navigation().some((menu) => menu.id === opened) ||
            this.utilities().some((menu) => menu.id === opened) ||
            (this.preset().bookmarks && opened === this.bookmarks.id);

        if (opened && !available) {
            this.opened.set(null);
        }
    });

    protected readonly closeOnViewportChange = effect(() => {
        this.isMobile();
        this.opened.set(null);
    });

    protected readonly resetContext = effect(() => {
        const preset = this.preset();

        this.layout();
        this.opened.set(null);
        this.selected.set(preset.menus.at(0)?.id ?? '');
        this.query.set('');
    });

    protected readonly syncTheme = effect(() => {
        this.darkMode();
        this.themeOverride.set(null);
    });

    protected readonly zones = ['public', 'applicant', 'student', 'employee'];
    protected readonly sizes = ['s', 'm', 'l'];
    protected readonly layouts = ['header', 'sidebar'];

    public readonly toolGroups = input(TOOL_GROUPS);
    public readonly configurable = input(false);
    public readonly zone = model<TuiOtusNavigationZone>('student');
    public readonly size = model<TuiOtusNavigationSize>('m');
    public readonly layout = model<'header' | 'sidebar'>('header');
    public readonly configuration = input<TuiOtusNavigationPreset | null>(null);
    public readonly showSearch = model(true);
    public readonly showNotifications = model(true);
    public readonly showLanguage = model(true);
    public readonly sidebarExpanded = model(true);

    protected selectSection(section: string): void {
        this.selected.set(section);
        this.opened.set(null);
    }

    protected toggleTheme(): void {
        this.themeOverride.set(this.currentTheme() === 'dark' ? 'light' : 'dark');
    }

    protected onOpenChange(id: string, open: boolean): void {
        if (open) {
            this.opened.set(id);
        } else if (this.opened() === id) {
            this.opened.set(null);
        }
    }

    protected selectDestination(section: string, title: string): void {
        if (this.mobileMenus().some((menu) => menu.id === section)) {
            this.selected.set(section);
        }

        if (section === 'language') {
            this.language.set(title === 'Русский' ? 'Рус' : 'Eng');
        }
    }

    protected navigate(section: string, title: string, close: () => void): void {
        this.selectDestination(section, title);
        close();
    }

    protected onShortcut(event: KeyboardEvent): void {
        if ((!event.metaKey && !event.ctrlKey) || event.key.toLowerCase() !== 'k') {
            return;
        }

        const trigger = this.utilityTriggers().find(
            ({nativeElement}) => nativeElement.dataset.menuId === 'search',
        );

        if (!trigger) {
            return;
        }

        event.preventDefault();
        trigger.nativeElement.focus();
        this.opened.set('search');
        afterNextRender(() => this.searchInput()?.nativeElement.focus(), {
            injector: this.injector,
        });
    }
}
