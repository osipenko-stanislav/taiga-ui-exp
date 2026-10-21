import {OTUS_COLOR_MAPPING} from '../generated/catalog';

const groups = new Map<string, Array<{name: string; hex: string}>>();

for (const token of OTUS_COLOR_MAPPING.primitives) {
    const separator = token.path.indexOf('/');
    const name = token.path.slice(0, separator);
    const colors = groups.get(name) ?? [];

    colors.push({
        name: token.path.slice(separator + 1).replaceAll('/', ' / '),
        hex: token.value,
    });
    groups.set(name, colors);
}

export const BRAND_COLOR_GROUPS = Array.from(groups, ([name, colors]) => ({
    name,
    colors,
}));
