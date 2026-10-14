import fs from 'node:fs';
import path from 'node:path';

import {OTUS_ICON_SETS} from '../otus-icons';
import {tuiPrepareOtusIcon} from './prepare-otus-icon';

const projectRoot = path.resolve(__dirname, '..');
const assetsSrc = path.join(projectRoot, 'assets');
const dest = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(projectRoot, 'src');

if (dest === assetsSrc || dest.startsWith(`${assetsSrc}${path.sep}`)) {
    throw new Error('Icon output must not replace the source assets');
}

for (const set of OTUS_ICON_SETS) {
    if (!fs.existsSync(path.join(assetsSrc, set))) {
        throw new Error(`Missing OTUS icon set: ${set}`);
    }
}

fs.rmSync(dest, {recursive: true, force: true});
fs.mkdirSync(dest, {recursive: true});

for (const set of OTUS_ICON_SETS) {
    fs.cpSync(path.join(assetsSrc, set), path.join(dest, set), {recursive: true});

    if (set === 'outline' || set === 'level') {
        for (const filename of fs.readdirSync(path.join(dest, set))) {
            if (filename.endsWith('.svg')) {
                const target = path.join(dest, set, filename);

                fs.writeFileSync(
                    target,
                    tuiPrepareOtusIcon(fs.readFileSync(target, 'utf8')),
                );
            }
        }
    }
}

process.stdout.write(`Prepared OTUS icon sets: ${OTUS_ICON_SETS.join(', ')}\n`);
