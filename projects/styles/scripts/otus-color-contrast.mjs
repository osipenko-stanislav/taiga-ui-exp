function rgba(color) {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const channels = hex.length === 3 ? Array.from(hex, (digit) => digit + digit) : hex.match(/../g);

        return [...channels.map((channel) => Number.parseInt(channel, 16)), 1];
    }

    const channels = color.match(/[\d.]+/g).map(Number);

    return [...channels.slice(0, 3), channels[3] ?? 1];
}

function composite(foreground, background, opacity = 1) {
    const alpha = foreground[3] * opacity;

    return [...foreground.slice(0, 3).map((value, index) => value * alpha + background[index] * (1 - alpha)), 1];
}

function luminance(channels) {
    return channels.slice(0, 3).reduce((sum, value, index) => {
        const channel = value / 255;
        const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

        return sum + linear * [0.2126, 0.7152, 0.0722][index];
    }, 0);
}

export function contrastAudit(mappings, schools, contextOverrides) {
    const lookup = new Map(mappings.map((row) => [row.tui, row]));
    const recipes = [
        {appearance: 'primary', background: '--tui-background-accent-1', foreground: '--tui-text-primary-on-accent-1'},
        {appearance: 'accent', background: '--tui-background-accent-2', foreground: '--tui-text-primary-on-accent-2'},
        {appearance: 'secondary', background: '--tui-background-neutral-1', foreground: '--tui-text-action'},
        {appearance: 'secondary-grayscale', background: '--tui-background-neutral-1', foreground: '--tui-text-primary'},
        {
            appearance: 'primary-grayscale',
            background: '--tui-background-accent-opposite',
            foreground: '--tui-background-base',
        },
        {
            appearance: 'floating',
            background: '--tui-background-elevation-2',
            backgroundPressed: '--tui-background-base-alt',
            foreground: '--tui-text-primary',
        },
        {
            appearance: 'secondary-invalid',
            background: '--tui-status-negative-pale',
            foreground: '--tui-text-negative',
            foregroundStates: true,
        },
        {
            appearance: 'primary-invalid',
            background: '--tui-status-negative',
            foreground: '--tui-text-primary-on-accent-1',
        },
        ...['positive', 'negative'].map((role) => ({
            appearance: `text-${role}`,
            background: '--tui-background-base',
            foreground: `--tui-text-${role}`,
            foregroundStates: true,
        })),
        ...['positive', 'negative', 'info', 'warning', 'neutral'].map((role) => ({
            appearance: `${role}-checked`,
            background: `--tui-status-${role}`,
            foreground: '#FFFFFF',
        })),
    ];
    const checks = [];

    function target(token, theme, school, appearance) {
        const override = contextOverrides.find(
            (item) => item.theme === theme && item.appearance === appearance && item.token === token,
        );

        if (override) {
            return override;
        }

        if (token.startsWith('#')) {
            return {value: token, opacity: 1};
        }

        return lookup.get(token).variants[theme].schools[school];
    }

    for (const theme of ['light', 'dark']) {
        for (const school of schools) {
            const canvas = target('--tui-background-base', theme, school.id).value;

            for (const recipe of recipes) {
                for (const state of ['default', 'hover', 'pressed']) {
                    const suffix = state === 'default' ? '' : `-${state}`;
                    const recipeBackground =
                        state === 'pressed' ? (recipe.backgroundPressed ?? recipe.background) : recipe.background;
                    const backgroundCandidates = [
                        recipeBackground + suffix,
                        `${recipeBackground}-hover`,
                        recipeBackground,
                    ];
                    const backgroundToken = backgroundCandidates.find((token) => lookup.has(token));
                    const foregroundState = `${recipe.foreground}-${state === 'pressed' ? 'hover' : state}`;
                    const foregroundToken =
                        recipe.foregroundStates && lookup.has(foregroundState) ? foregroundState : recipe.foreground;
                    const background = target(backgroundToken, theme, school.id, recipe.appearance);
                    const foreground = target(foregroundToken, theme, school.id, recipe.appearance);
                    const effectiveBackground = composite(rgba(background.value), rgba(canvas), background.opacity);
                    const effectiveForeground = composite(
                        rgba(foreground.value),
                        effectiveBackground,
                        foreground.opacity,
                    );
                    const first = luminance(effectiveForeground);
                    const second = luminance(effectiveBackground);
                    const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
                    const cssBackground = `rgb(${effectiveBackground.slice(0, 3).join(' ')})`;
                    const cssForeground = `rgb(${effectiveForeground.slice(0, 3).join(' ')})`;

                    checks.push({
                        appearance: recipe.appearance,
                        theme,
                        school: school.id,
                        state,
                        backgroundToken,
                        foregroundToken,
                        canvas,
                        ratio,
                        minimum: 4.5,
                        contextOverride: contextOverrides.some(
                            (item) => item.theme === theme && item.appearance === recipe.appearance,
                        ),
                        passes: ratio >= 4.5,
                        effectiveBackground: cssBackground,
                        effectiveForeground: cssForeground,
                    });
                }
            }
        }
    }

    return {
        standard: 'WCAG 2.2 AA / 1.4.3',
        reference: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
        scope: 'Normal text on listed Taiga appearance token pairs in default, hover and pressed, composited on background-base. This is not a full accessibility conformance audit.',
        exclusions: [
            'CSS filter states (primary-destructive), images/gradients, custom appearances, focus indicators and non-text contrast are not evaluated.',
            'Disabled controls are excluded. Ratios use unrounded sRGB values; display rounding never changes pass/fail.',
        ],
        passed: checks.filter((check) => check.passes).length,
        failed: checks.filter((check) => !check.passes).length,
        checks,
    };
}
