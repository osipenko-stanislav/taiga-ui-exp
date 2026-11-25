export const OTUS_PAGE_METADATA: Readonly<
    Record<
        string,
        {
            title: string;
            description: string;
            related: ReadonlyArray<{title: string; href: string}>;
        }
    >
> = {
    'components-button': {
        title: 'Button',
        description:
            'Кнопка запускает действие: отправляет форму, подтверждает выбор или открывает следующий шаг. Поддерживает разные размеры, оформление, иконки и состояние загрузки.',
        related: [
            {title: 'Link', href: './?path=/docs/components-link--docs'},
            {
                title: 'ButtonGroup',
                href: './?path=/docs/components-buttons-buttongroup--docs',
            },
        ],
    },
};
