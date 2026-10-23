import {type AfterViewChecked, Directive, inject, input} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WaResizeObserverService} from '@ng-web-apis/resize-observer';
import {tuiZonefree} from '@taiga-ui/cdk/observables';
import {tuiInjectElement} from '@taiga-ui/cdk/utils/dom';
import {tuiPx} from '@taiga-ui/cdk/utils/miscellaneous';
import {type TuiHorizontalDirection} from '@taiga-ui/core/types';

import {TuiTabsDirective} from './tabs.directive';

@Directive({
    selector: 'tui-tabs[vertical]',
    providers: [WaResizeObserverService],
    hostDirectives: [
        {
            directive: TuiTabsDirective,
            inputs: ['activeItemIndex', 'size'],
            outputs: ['activeItemIndexChange'],
        },
    ],
    host: {
        '[attr.data-vertical]': 'vertical()',
        '(animationend)': 'refresh()',
        '(keydown.arrowDown.prevent)': 'onKeyDownArrow($event.target, 1)',
        '(keydown.arrowUp.prevent)': 'onKeyDownArrow($event.target, -1)',
    },
})
export class TuiTabsVertical implements AfterViewChecked {
    private readonly el = tuiInjectElement();
    private readonly tabs = inject(TuiTabsDirective);

    protected readonly sub = inject(WaResizeObserverService, {self: true})
        .pipe(tuiZonefree(), takeUntilDestroyed())
        .subscribe(() => this.refresh());

    public readonly vertical = input<TuiHorizontalDirection>('start');

    public ngAfterViewChecked(): void {
        this.refresh();
    }

    protected refresh(): void {
        const {activeElement} = this.tabs;

        if (activeElement && !activeElement.isConnected) {
            return;
        }

        const {offsetTop = 0, offsetHeight = 0} = activeElement || {};

        this.el.style.setProperty('--t-top', tuiPx(offsetTop));
        this.el.style.setProperty('--t-height', tuiPx(offsetHeight));
    }

    protected onKeyDownArrow(current: HTMLElement, step: number): void {
        this.tabs.moveFocus(current, step);
    }
}
