import {DOCUMENT} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    type ElementRef,
    inject,
    model,
    signal,
    viewChild,
} from '@angular/core';
import {TuiDocAPI, TuiDocAPIItem} from '@taiga-ui/addon-doc';
import {TuiAppearance, TuiButton, type TuiSizeL} from '@taiga-ui/core';
import {TuiButtonGroup, TuiOtusTab, TuiTabs} from '@taiga-ui/kit';
import {TuiFloatingContainer} from '@taiga-ui/layout';

@Component({
    selector: 'otus-tabs-story',
    imports: [
        TuiAppearance,
        TuiButton,
        TuiButtonGroup,
        TuiDocAPI,
        TuiDocAPIItem,
        TuiFloatingContainer,
        TuiOtusTab,
        TuiTabs,
    ],
    templateUrl: './otus-tabs.component.html',
    styleUrl: './otus-tabs.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiOtusTabsStory {
    private readonly doc = inject(DOCUMENT);
    private readonly floatingGroup =
        viewChild.required<ElementRef<HTMLElement>>('floatingGroup');

    protected readonly entrancePlaying = signal(false);
    protected readonly entranceOffset = signal<string | null>(null);
    protected readonly appearances = ['primary', 'accent'] as const;
    protected readonly activeBackground = computed(() =>
        this.appearance() === 'primary'
            ? 'var(--tui-background-accent-1)'
            : 'var(--tui-background-accent-2)',
    );

    protected readonly sizes: readonly TuiSizeL[] = ['m', 'l'];
    protected readonly singleIndex = signal(0);
    protected readonly activeItemIndex = signal(0);
    protected readonly baselineIndex = signal(0);
    protected readonly floatingIndex = signal(0);
    protected readonly floatingTabs = ['Разработка • ИИ • Бизнес и аналитика', 'Дизайн'];
    protected readonly tabs = [
        'Программа',
        'Поступление',
        'Стоимость',
        'Преподаватели',
        'Отзывы',
    ];

    public readonly size = model<TuiSizeL>('l');
    public readonly appearance = model<'accent' | 'primary'>('accent');

    protected replayEntrance(): void {
        const view = this.doc.defaultView;

        if (!view) {
            return;
        }

        if (view.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.entrancePlaying.set(false);

            return;
        }

        const element = this.floatingGroup().nativeElement;
        const transform = view.getComputedStyle(element).transform;
        const translation =
            transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;

        const restingTop = element.getBoundingClientRect().top - translation;
        const viewportBottom =
            (view.visualViewport?.offsetTop ?? 0) +
            (view.visualViewport?.height ?? view.innerHeight);

        this.entranceOffset.set(
            `${Math.ceil(Math.max(0, viewportBottom - restingTop))}px`,
        );
        this.entrancePlaying.set(true);

        // Restart only this entrance; native tab and button animations keep their state.
        for (const animation of this.entranceAnimations()) {
            animation.currentTime = 0;
            animation.play();
        }
    }

    protected finishEntrance(event: AnimationEvent): void {
        if (
            event.target === this.floatingGroup().nativeElement &&
            event.animationName.endsWith('otusFloatingShape')
        ) {
            // A previous run can deliver its end event after the next run has started.
            const stillPlaying = this.entranceAnimations().some(
                (animation) =>
                    animation.animationName.endsWith('otusFloatingShape') &&
                    animation.playState !== 'finished',
            );

            if (!stillPlaying) {
                this.entrancePlaying.set(false);
            }
        }
    }

    private entranceAnimations(): CSSAnimation[] {
        return this.floatingGroup()
            .nativeElement.getAnimations({subtree: true})
            .filter(
                (animation): animation is CSSAnimation =>
                    animation instanceof CSSAnimation &&
                    animation.animationName.includes('otusFloating'),
            );
    }
}
