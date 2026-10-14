import {TestBed} from '@angular/core/testing';

import {TUI_BUTTON_MOTION} from '../../components/button/button-motion';
import {TUI_ASSETS_PATH} from '../assets-path';
import {TUI_ICON_RESOLVER} from '../icon-resolver';

describe('OTUS library defaults', () => {
    it('enables core button motion without application providers', () => {
        expect(TestBed.inject(TUI_BUTTON_MOTION)()).toBe('otus-core');
    });

    it('resolves component icons from the OTUS pack and respects the assets path', () => {
        TestBed.configureTestingModule({
            providers: [{provide: TUI_ASSETS_PATH, useValue: '/custom/icons'}],
        });

        const resolve = TestBed.inject(TUI_ICON_RESOLVER);

        expect(resolve('@tui.search')).toBe('/custom/icons/outline/search-md-lined.svg');
        expect(resolve('@otus.outline.x-lined')).toBe(
            '/custom/icons/outline/x-lined.svg',
        );
    });
});
