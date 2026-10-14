import {type StorybookConfig} from '@storybook/angular';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.ts'],
    addons: ['@storybook/addon-docs'],
    framework: {name: '@storybook/angular', options: {}},
    staticDirs: [
        {from: '../../icons/src', to: '/assets/taiga-ui/icons'},
        {from: '../../demo/src/assets', to: '/assets'},
    ],
    core: {disableTelemetry: true},
    previewHead: (head) =>
        `${head}<base href="${process.env['STORYBOOK_BASE_HREF'] ?? '/'}" />`,
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
