import {ClipboardModule} from '@angular/cdk/clipboard';
import {isPlatformServer} from '@angular/common';
import {Component, computed, inject, input, PLATFORM_ID, signal} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {TuiDocCopy} from '@taiga-ui/addon-doc';
import {TuiTable} from '@taiga-ui/addon-table';
import {tuiInjectElement, TuiPlatform} from '@taiga-ui/cdk';

@Component({
    selector: 'tr[tuiFont]',
    imports: [ClipboardModule, TuiDocCopy, TuiTable],
    templateUrl: './font.component.html',
    styleUrl: './font.component.less',
    changeDetection,
    host: {'[attr.data-font]': 'tuiFont()', '[style.font]': '`var(${tuiFont()})`'},
})
export class TuiFont {
    public readonly tuiFont = input('');

    protected readonly el = tuiInjectElement();
    protected readonly platform = inject(TuiPlatform);

    protected readonly styles = isPlatformServer(inject(PLATFORM_ID))
        ? signal(this.el.style)
        : computed((_ = this.tuiFont(), __ = this.platform.tuiPlatform()) =>
              getComputedStyle(this.el),
          );

    protected readonly ratio = computed(({fontSize, lineHeight} = this.styles()) =>
        (Number.parseInt(lineHeight) / Number.parseInt(fontSize)).toFixed(2),
    );

    protected readonly tracking = isPlatformServer(inject(PLATFORM_ID))
        ? signal('normal')
        : computed(
              (_ = this.tuiFont(), __ = this.platform.tuiPlatform()) =>
                  getComputedStyle(this.el.querySelector('td') ?? this.el).letterSpacing,
          );
}
