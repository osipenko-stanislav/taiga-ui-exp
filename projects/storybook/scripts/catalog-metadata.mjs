const categoryLabels = new Map([
    ['Documentation', 'Основы'],
    ['Components', 'Компоненты'],
    ['Form', 'Компоненты'],
    ['Layout', 'Компоненты'],
    ['Navigation', 'Компоненты'],
    ['Charts', 'Компоненты'],
    ['Tools', 'Основы'],
]);

const figmaByRoute = new Map();

export function pageMetadata(page) {
    const [section, ...rest] = page.path;
    const category = categoryLabels.get(section) ?? 'Компоненты';
    const path = rest.length ? rest : page.path;
    const title = [category, ...path].join('/');

    return {
        category,
        title,
        description: `Интерактивная документация ${path.at(-1) ?? 'компонента'}: пример, варианты и исходная разметка.`,
        figmaUrl: figmaByRoute.get(page.route) ?? null,
        related: [],
    };
}
