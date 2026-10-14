import {DOCUMENT} from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    signal,
} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {
    TuiButton,
    TuiCheckbox,
    TuiDataList,
    TuiInput,
    TuiLabel,
    TuiLink,
    TuiRadio,
    TuiTitle,
} from '@taiga-ui/core';
import {TuiBadge, TuiChip, TuiSegmented, TuiSwitch, TuiTabs} from '@taiga-ui/kit';

import {
    CONTROL_TEXT_SAMPLES,
    type TuiControlTypographyToken,
} from './control-typography.samples';

interface TextMetrics {
    readonly token: TuiControlTypographyToken;
    readonly family: string;
    readonly weight: string;
    readonly size: string;
    readonly lineHeight: string;
    readonly letterSpacing: string;
}

@Component({
    selector: 'tui-control-typography',
    imports: [
        ReactiveFormsModule,
        TuiBadge,
        TuiButton,
        TuiCheckbox,
        TuiChip,
        TuiDataList,
        TuiInput,
        TuiLabel,
        TuiLink,
        TuiRadio,
        TuiSegmented,
        TuiSwitch,
        TuiTabs,
        TuiTitle,
    ],
    templateUrl: './control-typography.component.html',
    styleUrl: './control-typography.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(focusin)': 'refreshMetrics()',
        '(focusout)': 'refreshMetrics()',
        '(input)': 'refreshMetrics()',
        '(transitionend)': 'refreshMetrics()',
    },
})
export class TuiControlTypography {
    private readonly doc = inject(DOCUMENT);
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private readonly destroyRef = inject(DestroyRef);
    private frame = 0;
    private destroyed = false;

    protected readonly samples = CONTROL_TEXT_SAMPLES;
    protected readonly metrics = signal<Readonly<Record<string, TextMetrics>>>({});
    protected readonly fieldControls = Object.fromEntries(
        CONTROL_TEXT_SAMPLES.filter((sample) =>
            ['field-label', 'floating-label', 'input', 'label', 'placeholder'].includes(
                sample.kind,
            ),
        ).map(
            (sample) =>
                [
                    sample.id,
                    new FormControl(
                        sample.kind === 'input' || sample.kind === 'floating-label'
                            ? 'Александр'
                            : '',
                        {nonNullable: true},
                    ),
                ] as const,
        ),
    );

    protected readonly descriptionControl = new FormControl(false, {nonNullable: true});

    constructor() {
        afterNextRender(() => {
            const schedule = (): void => this.refreshMetrics();
            const resize = new ResizeObserver(schedule);
            const theme = new MutationObserver(schedule);
            const root = this.element.closest('tui-root');

            resize.observe(this.element);

            if (root) {
                theme.observe(root, {attributes: true});
            }

            this.doc.fonts.addEventListener('loadingdone', schedule);
            void this.doc.fonts.ready.then(schedule);
            schedule();
            this.destroyRef.onDestroy(() => {
                this.destroyed = true;
                resize.disconnect();
                theme.disconnect();
                this.doc.fonts.removeEventListener('loadingdone', schedule);
                this.doc.defaultView?.cancelAnimationFrame(this.frame);
            });
        });
    }

    protected refreshMetrics(): void {
        const window = this.doc.defaultView;

        if (!window || this.destroyed) {
            return;
        }

        window.cancelAnimationFrame(this.frame);
        this.frame = window.requestAnimationFrame(() => this.measure());
    }

    private measure(): void {
        const metrics: Record<string, TextMetrics> = {};

        for (const sample of this.samples) {
            const element = this.element.querySelector(
                `[data-sample="${sample.id}"] ${sample.target}`,
            );

            if (!element) {
                continue;
            }

            let token = sample.token;

            if (sample.kind === 'field-label' || sample.kind === 'floating-label') {
                const field = element.closest('tui-textfield');
                const input = field?.querySelector('input');

                token =
                    input?.value || field?.matches(':focus-within')
                        ? '--tui-typography-ui-s'
                        : '--tui-typography-ui-m';
            }

            let pseudo: string | null = null;

            if (sample.kind === 'placeholder') {
                pseudo = '::placeholder';
            } else if (sample.kind === 'group-label') {
                pseudo = '::before';
            }

            const style = this.doc.defaultView!.getComputedStyle(element, pseudo);

            metrics[sample.id] = {
                token,
                family: style.fontFamily,
                weight: style.fontWeight,
                size: style.fontSize,
                lineHeight: style.lineHeight,
                letterSpacing: style.letterSpacing,
            };
        }

        this.metrics.set(metrics);
    }
}
