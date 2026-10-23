import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ViewEncapsulation,
} from '@angular/core';
import {TUI_VERSION} from '@taiga-ui/cdk/constants';
import {tuiWithStyles} from '@taiga-ui/cdk/utils/miscellaneous';
import {TuiButtonMotion} from '@taiga-ui/core/components/button';

@Component({
    template: '',
    styles: `
        [data-tui-version='${TUI_VERSION}'] {
            @import './tabs-otus.style.less';
        }
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: `tui-tab-otus-${TUI_VERSION}`,
})
class Styles {}

@Directive({
    selector: '[tuiTab][tuiOtusTab]',
    hostDirectives: [TuiButtonMotion],
})
export class TuiOtusTab {
    protected readonly nothing = tuiWithStyles(Styles);
}
