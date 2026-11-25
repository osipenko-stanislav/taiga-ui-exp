import {DOCUMENT} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject, input, signal} from '@angular/core';
import {TuiButton} from '@taiga-ui/core';

@Component({
    selector: 'otus-page-shell',
    imports: [TuiButton],
    templateUrl: './page-shell.component.html',
    styleUrl: './page-shell.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuiPageShell {
    private readonly document = inject(DOCUMENT);

    protected readonly copied = signal(false);
    public readonly title = input.required<string>();
    public readonly version = input('OTUS · эксперимент');
    public readonly description = input.required<string>();
    public readonly figmaUrl = input<string | null>(null);
    public readonly related = input<ReadonlyArray<{title: string; href: string}>>([]);
    public readonly sections = input<ReadonlyArray<'overview' | 'api' | 'variations'>>([
        'overview',
        'variations',
    ]);

    protected async copyLink(): Promise<void> {
        const url = this.document.defaultView?.location.href;

        if (!url || !navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(url);
        this.copied.set(true);
        window.setTimeout(() => this.copied.set(false), 1800);
    }
}
