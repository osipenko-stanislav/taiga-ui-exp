import {
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    inject,
    input,
} from '@angular/core';
import {TuiPlatform} from '@taiga-ui/cdk';
import {TUI_DARK_MODE, TuiRoot} from '@taiga-ui/core';

import {CustomHost} from '../../../demo/src/pages/customization/portals/examples/1/portal';
import {TuiColorMappingEditor} from '../color-mapping/color-mapping-editor.service';
import {TuiStorybookButtonMotion} from './button-motion.service';

@Component({
    selector: 'tui-storybook-root',
    imports: [CustomHost, TuiRoot],
    templateUrl: './root.component.html',
    styleUrl: './root.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [TuiPlatform],
})
export class TuiStorybookRoot {
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly colorEditor = inject(TuiColorMappingEditor);
    private readonly draftProperties = new Set<string>();
    private readonly darkMode = inject(TUI_DARK_MODE);
    private readonly buttonMotion = inject(TuiStorybookButtonMotion);

    protected readonly syncTheme = effect(() =>
        this.darkMode.set(this.theme() === 'dark'),
    );

    protected readonly syncButtonMotion = effect(() =>
        this.buttonMotion.setMode(this.direction()),
    );

    protected readonly syncColorDraft = afterRenderEffect(() => {
        const changes = this.colorEditor.previewEnabled()
            ? this.colorEditor.overrides()
            : [];

        const school = this.brand();
        const root = this.element.nativeElement.querySelector<HTMLElement>('tui-root');

        if (!root) {
            return;
        }

        for (const property of this.draftProperties) {
            root.style.removeProperty(property);
        }

        this.draftProperties.clear();

        for (const change of changes.filter((entry) => entry.school === school)) {
            const row = this.colorEditor
                .mapping()
                .mappings.find((item) => item.tui === change.token)!;

            const property = `--t-otus-${change.theme}-${change.token.slice(6)}`;

            root.style.setProperty(
                property,
                row.variants[change.theme].schools[school].css,
            );
            this.draftProperties.add(property);
        }
    });

    public readonly theme = input<'dark' | 'light'>('light');
    public readonly brand = input<
        'otus-design' | 'otus-nature' | 'otus-tech' | 'otus-university'
    >('otus-tech');

    public readonly direction = input<'otus-brand' | 'otus-core'>('otus-core');

    public readonly breakpoint = input<'otus-desktop' | 'otus-mobile' | 'otus-tablet'>(
        'otus-desktop',
    );
}
