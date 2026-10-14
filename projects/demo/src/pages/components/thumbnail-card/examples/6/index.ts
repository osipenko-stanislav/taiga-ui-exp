import {Component, inject} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {encapsulation} from '@demo/emulate/encapsulation';
import {
    TUI_PAYMENT_SYSTEM_ICONS,
    TUI_THUMBNAIL_CARD_OPTIONS,
    TuiThumbnailCard,
    type TuiThumbnailCardOptions,
} from '@taiga-ui/addon-commerce';

@Component({
    imports: [TuiThumbnailCard],
    templateUrl: './index.html',
    styleUrl: './index.less',
    encapsulation,
    changeDetection,
    providers: [
        {
            provide: TUI_THUMBNAIL_CARD_OPTIONS,
            useFactory: (): TuiThumbnailCardOptions => ({
                size: 'l',
                // Swap the default monochrome `@otus.outline.credit-card-01-lined` for the colored `@otus.outline.credit-card-01-lined`
                icons: {
                    ...inject(TUI_PAYMENT_SYSTEM_ICONS),
                    visa: '@otus.outline.credit-card-01-lined',
                },
            }),
        },
    ],
})
export default class Example {}
