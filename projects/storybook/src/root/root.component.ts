import {ChangeDetectionStrategy, Component, effect, inject, input} from '@angular/core';
import {TuiPlatform} from '@taiga-ui/cdk';
import {TUI_DARK_MODE, TuiRoot} from '@taiga-ui/core';

import {CustomHost} from '../../../demo/src/pages/customization/portals/examples/1/portal';
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
    private readonly darkMode = inject(TUI_DARK_MODE);
    private readonly buttonMotion = inject(TuiStorybookButtonMotion);

    protected readonly syncTheme = effect(() =>
        this.darkMode.set(this.theme() === 'dark'),
    );

    protected readonly syncButtonMotion = effect(() =>
        this.buttonMotion.setMode(this.direction()),
    );

    public readonly theme = input<'dark' | 'light'>('light');
    public readonly brand = input<
        'otus-design' | 'otus-nature' | 'otus-tech' | 'otus-university'
    >('otus-tech');

    public readonly direction = input<'otus-brand' | 'otus-core'>('otus-core');

    public readonly breakpoint = input<'otus-desktop' | 'otus-mobile' | 'otus-tablet'>(
        'otus-desktop',
    );
}
