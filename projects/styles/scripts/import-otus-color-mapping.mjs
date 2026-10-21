import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {generateOtusColors} from './generate-otus-colors.mjs';
import {colorMapping} from './otus-color-mapping.mjs';
import {validateColorOverrides} from './otus-color-overrides.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const filename = process.argv[2];

if (!filename) {
    throw new Error('Укажите путь к JSON, скачанному из редактора маппинга.');
}

const exported = JSON.parse(await readFile(filename, 'utf8'));
const configuration = exported.configuration ?? exported;

if (configuration.schemaVersion !== 1) {
    throw new Error('Неизвестная версия настроек маппинга.');
}

const overrides = validateColorOverrides(await colorMapping(root), configuration.overrides);

await writeFile(
    path.join(root, 'projects/styles/tokens/otus-color-overrides.json'),
    `${JSON.stringify({schemaVersion: 1, overrides}, null, 4)}\n`,
);
await generateOtusColors(root);
process.stdout.write(`Применено настроек маппинга: ${overrides.length}. Пересоберите Storybook и библиотеку.\n`);
