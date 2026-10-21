import {contrastAudit} from './otus-color-contrast.mjs';

export function validateColorOverrides(mapping, overrides) {
    if (!Array.isArray(overrides)) {
        throw new Error('Настройки маппинга должны быть массивом.');
    }

    const keys = new Set();

    for (const entry of overrides) {
        if (
            !entry ||
            typeof entry !== 'object' ||
            !['dark', 'light'].includes(entry.theme) ||
            !mapping.schoolAssignments.some((school) => school.id === entry.school)
        ) {
            throw new Error('Некорректная настройка маппинга.');
        }

        const row = mapping.mappings.find((item) => item.tui === entry.token);
        const target = row?.variants[entry.theme]?.schools[entry.school];
        const primitive = mapping.primitives.find((item) => item.path === entry.primitive);
        const key = `${entry.theme}/${entry.school}/${entry.token}`;

        if (!target || target.alias || !primitive || keys.has(key)) {
            throw new Error(`Недоступное или повторяющееся соответствие: ${key}`);
        }

        keys.add(key);
    }

    return overrides;
}

export function applyColorOverrides(mapping, overrides) {
    validateColorOverrides(mapping, overrides);
    const result = JSON.parse(JSON.stringify(mapping));

    for (const entry of overrides) {
        const row = result.mappings.find((item) => item.tui === entry.token);
        const target = row.variants[entry.theme].schools[entry.school];
        const primitive = result.primitives.find((item) => item.path === entry.primitive);

        Object.assign(target, {
            primitive: primitive.path,
            cssVariable: primitive.cssVariable,
            value: primitive.value,
            css:
                target.opacity === 1
                    ? `var(${primitive.cssVariable})`
                    : `color-mix(in srgb, var(${primitive.cssVariable}) ${target.opacity * 100}%, transparent)`,
            reason: 'Выбрано вручную из палитры OTUS. Прозрачность исходного соответствия сохранена.',
        });
    }

    for (const row of result.mappings) {
        for (const theme of ['light', 'dark']) {
            for (const school of result.schoolAssignments) {
                const target = row.variants[theme].schools[school.id];

                if (target.alias) {
                    const source = result.mappings.find((item) => item.tui === target.alias).variants[theme].schools[
                        school.id
                    ];

                    Object.assign(target, {
                        primitive: source.primitive,
                        value: source.value,
                        cssVariable: source.cssVariable,
                        opacity: source.opacity,
                    });
                }
            }
        }
    }

    result.accessibility = contrastAudit(result.mappings, result.schoolAssignments, result.contextOverrides);

    return result;
}
