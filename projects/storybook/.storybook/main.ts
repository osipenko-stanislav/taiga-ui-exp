import {type StorybookConfig} from '@storybook/angular';

// Preserve shared links when Storybook pages move or merge.
const storyRedirects = `<script>
    const pageUrl = new URL(window.location.href);
    const redirects = {
        'documentation-styles-colors-otus-tokens--table': 'documentation-styles-colors-taiga-to-otus-mapping--table',
        'navigation-student-navigation-otus-experimental--desktop': 'navigation-otus-experiment--student'
    };
    const storyPath = pageUrl.searchParams.get('path');
    const oldId = storyPath?.startsWith('/story/') ? storyPath.slice(7) : pageUrl.searchParams.get('id');
    const newId = Object.hasOwn(redirects, oldId) ? redirects[oldId] : null;
    if (newId) {
        pageUrl.searchParams.set(storyPath ? 'path' : 'id', storyPath ? '/story/' + newId : newId);
        window.location.replace(pageUrl.href);
    }
</script>`;

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.ts'],
    addons: ['@storybook/addon-docs'],
    framework: {name: '@storybook/angular', options: {}},
    staticDirs: [
        {from: '../../icons/src', to: '/assets/taiga-ui/icons'},
        {from: '../../demo/src/assets', to: '/assets'},
    ],
    core: {disableTelemetry: true},
    managerHead: (head) => `${head}${storyRedirects}`,
    previewHead: (head) =>
        `${head}${storyRedirects}<base href="${process.env['STORYBOOK_BASE_HREF'] ?? '/'}" />`,
    webpackFinal: (configuration) => {
        configuration.module ??= {rules: []};
        configuration.module.rules ??= [];
        configuration.module.rules.push({
            test: /\.svg$/,
            issuer: /\.ts$/,
            type: 'asset/source',
        });

        return configuration;
    },
};

export default config;
