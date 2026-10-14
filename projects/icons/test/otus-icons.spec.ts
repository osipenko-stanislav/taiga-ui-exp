import fs from 'node:fs';
import path from 'node:path';

import {OTUS_ICON_ALIASES, OTUS_ICON_SETS, tuiResolveOtusIcon} from '../otus-icons';

describe('OTUS icon assets', () => {
    it('resolves both the new names and legacy component defaults', () => {
        expect(tuiResolveOtusIcon('@otus.outline.plus-lined')).toBe(
            'assets/taiga-ui/icons/outline/plus-lined.svg',
        );
        expect(tuiResolveOtusIcon('@tui.search')).toBe(
            'assets/taiga-ui/icons/outline/search-md-lined.svg',
        );
        expect(tuiResolveOtusIcon('@tui.heart-filled', '/icons')).toBe(
            '/icons/flat/heart-filled.svg',
        );
    });

    it('ships all four sets and every compatibility alias points to an existing SVG', () => {
        const root = path.resolve(__dirname, '../src');

        expect(fs.readdirSync(root).sort()).toEqual([...OTUS_ICON_SETS].sort());

        for (const icon of Object.keys(OTUS_ICON_ALIASES)) {
            expect(fs.existsSync(tuiResolveOtusIcon(icon, root))).toBe(true);
        }
    });
});
