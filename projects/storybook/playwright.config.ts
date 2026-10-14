import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    outputDir: './tests-results',
    reporter: 'list',
    workers: 1,
    use: {
        baseURL: process.env['STORYBOOK_URL'] ?? 'http://127.0.0.1:6006',
        channel: 'chrome',
        headless: true,
    },
});
