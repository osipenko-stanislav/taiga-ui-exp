import {Component} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {TuiDemo, TuiFont} from '@demo/utils';
import {TuiTable} from '@taiga-ui/addon-table';

@Component({
    imports: [TuiDemo, TuiFont, TuiTable],
    templateUrl: './index.html',
    styleUrl: './index.less',
    changeDetection,
})
export default class Page {
    protected readonly tabs = ['Headings', 'Body', 'UI'] as const;

    protected readonly sections = {
        Headings: {
            title: 'Заголовки',
            description:
                'Graphik Semibold 600. Плотность букв настроена по размеру заголовка.',
        },
        Body: {
            title: 'Наборный текст · Regular content',
            description:
                'Graphik Regular 400. Более свободный интерлиньяж для абзацев и длинного текста.',
        },
        UI: {
            title: 'UI-текст · Reduced line height',
            description:
                'Graphik Regular 400. Тот же размер шрифта, но более компактный интерлиньяж для интерфейса.',
        },
    };

    protected readonly comparison = [
        'Учимся новому каждый день.',
        'Обмениваемся идеями.',
        'Находим решения вместе.',
    ];

    protected readonly groups = {
        Headings: [
            '--tui-typography-heading-h1',
            '--tui-typography-heading-h2',
            '--tui-typography-heading-h3',
            '--tui-typography-heading-h4',
            '--tui-typography-heading-h5',
            '--tui-typography-heading-h6',
        ],
        Body: [
            '--tui-typography-body-l',
            '--tui-typography-body-m',
            '--tui-typography-body-s',
            '--tui-typography-body-xs',
        ],
        UI: [
            '--tui-typography-ui-l',
            '--tui-typography-ui-m',
            '--tui-typography-ui-s',
            '--tui-typography-ui-xs',
            '--tui-typography-ui-2xs',
        ],
    };
}
