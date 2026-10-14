export type TuiControlTypographyToken =
    | `--tui-typography-body-${'l' | 'm' | 's' | 'xs'}`
    | `--tui-typography-ui-${'2xs' | 'l' | 'm' | 's' | 'xs'}`;

interface SampleBase {
    readonly id: string;
    readonly name: string;
    readonly target: string;
    readonly token: TuiControlTypographyToken;
    readonly override?: string;
    readonly context?: string;
}

export type TuiControlTextSample = SampleBase &
    (
        | {
              readonly kind:
                  'description' | 'group-label' | 'label' | 'link' | 'option' | 'tab';
              readonly size?: never;
          }
        | {
              readonly kind: 'input' | 'placeholder';
              readonly size: 'l' | 'm' | 's';
          }
        | {readonly kind: 'badge'; readonly size: 'l' | 'm' | 's' | 'xl'}
        | {readonly kind: 'button'; readonly size: 'l' | 'm' | 's' | 'xs'}
        | {readonly kind: 'checkbox' | 'radio' | 'switch'; readonly size: 'm' | 's'}
        | {readonly kind: 'chip'; readonly size: 'm' | 's' | 'xs' | 'xxs'}
        | {readonly kind: 'field-label' | 'floating-label'; readonly size: 'l'}
        | {readonly kind: 'segmented'; readonly size: 'l' | 'm' | 's'}
    );

const BADGE_TOKENS = {
    s: '--tui-typography-ui-2xs',
    m: '--tui-typography-ui-s',
    l: '--tui-typography-ui-s',
    xl: '--tui-typography-ui-m',
} as const satisfies Readonly<Record<string, TuiControlTypographyToken>>;

const CHIP_TOKENS = {
    xxs: '--tui-typography-ui-2xs',
    xs: '--tui-typography-ui-s',
    s: '--tui-typography-ui-s',
    m: '--tui-typography-ui-m',
} as const satisfies Readonly<Record<string, TuiControlTypographyToken>>;

export const CONTROL_TEXT_SAMPLES: readonly TuiControlTextSample[] = [
    ...(['xs', 's', 'm', 'l'] as const).map((size) => ({
        id: `button-${size}`,
        name: `Button ${size.toUpperCase()}`,
        kind: 'button' as const,
        size,
        target: 'button',
        token:
            size === 'xs' || size === 's'
                ? ('--tui-typography-body-s' as const)
                : ('--tui-typography-body-m' as const),
        override: 'font-weight: 500',
    })),
    ...(['input', 'placeholder'] as const).flatMap((kind) =>
        (['s', 'm', 'l'] as const).map((size) => ({
            id: `${kind}-${size}`,
            name: `Input ${size.toUpperCase()} · ${kind === 'input' ? 'значение' : 'placeholder'}`,
            kind,
            size,
            target: 'input',
            token:
                size === 'l'
                    ? ('--tui-typography-ui-m' as const)
                    : ('--tui-typography-ui-s' as const),
            override: kind === 'placeholder' ? 'Шрифт наследуется от input' : undefined,
            context:
                kind === 'input'
                    ? 'Поле заполнено: введённый текст'
                    : 'Пустое поле: placeholder',
        })),
    ),
    {
        id: 'field-label-l',
        name: 'Input L · label',
        kind: 'field-label',
        size: 'l',
        target: 'label',
        token: '--tui-typography-ui-m',
        override: 'line-height: 1.25',
        context: 'Пустое поле: подпись внутри',
    },
    {
        id: 'floating-label-l',
        name: 'Input L · label',
        kind: 'floating-label',
        size: 'l',
        target: 'label',
        token: '--tui-typography-ui-s',
        override: 'line-height: 1.25',
        context: 'Поле заполнено: подпись поднята',
    },
    ...(['checkbox', 'radio', 'switch'] as const).flatMap((kind) =>
        (['s', 'm'] as const).map((size) => ({
            id: `${kind}-${size}`,
            name: `${kind} label ${size.toUpperCase()}`,
            kind,
            size,
            target: 'label > span',
            token: '--tui-typography-body-m' as const,
            override: 'Наследуется от tuiLabel',
        })),
    ),
    ...(['s', 'm', 'l', 'xl'] as const).map((size) => ({
        id: `badge-${size}`,
        name: `Badge ${size.toUpperCase()}`,
        kind: 'badge' as const,
        size,
        target: '[tuiBadge]',
        token: BADGE_TOKENS[size],
    })),
    ...(['xxs', 'xs', 's', 'm'] as const).map((size) => ({
        id: `chip-${size}`,
        name: `Chip ${size.toUpperCase()}`,
        kind: 'chip' as const,
        size,
        target: '[tuiChip]',
        token: CHIP_TOKENS[size],
    })),
    ...(['s', 'm', 'l'] as const).map((size) => ({
        id: `segmented-${size}`,
        name: `Segmented ${size.toUpperCase()}`,
        kind: 'segmented' as const,
        size,
        target: 'button',
        token: `--tui-typography-body-${size}` as const,
    })),
    {
        id: 'link',
        name: 'Link',
        kind: 'link',
        target: 'a',
        token: '--tui-typography-body-m',
        override: 'font: inherit; токен контейнера образца',
    },
    {
        id: 'tab',
        name: 'Tab',
        kind: 'tab',
        target: 'button',
        token: '--tui-typography-body-m',
        override: 'Наследуется от tui-tabs',
    },
    {
        id: 'option',
        name: 'Data list option',
        kind: 'option',
        target: 'button',
        token: '--tui-typography-ui-m',
    },
    {
        id: 'group-label',
        name: 'Data list group label',
        kind: 'group-label',
        target: 'tui-opt-group',
        token: '--tui-typography-ui-l',
        override: 'font-weight: 700',
    },
    {
        id: 'label',
        name: 'Label · подпись поля',
        kind: 'label',
        target: 'label > span',
        token: '--tui-typography-body-s',
        context: 'Внешняя подпись над полем M',
    },
    {
        id: 'description',
        name: 'Label · описание',
        kind: 'description',
        target: '[tuiSubtitle]',
        token: '--tui-typography-ui-s',
        context: 'Описание под подписью checkbox',
    },
];
