import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {TuiButton} from '../button.directive';
import {TUI_BUTTON_MOTION, type TuiButtonMotionMode} from '../button-motion';

describe('Button motion', () => {
    @Component({
        imports: [TuiButton],
        template: '<button tuiButton type="button">{{ label() }}</button>',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Test {
        public readonly label = signal('Continue');
    }

    const mode = signal<TuiButtonMotionMode>('otus-core');
    let fixture: ComponentFixture<Test>;
    let button: HTMLButtonElement;

    beforeEach(async () => {
        mode.set('otus-core');
        TestBed.configureTestingModule({
            imports: [Test],
            providers: [{provide: TUI_BUTTON_MOTION, useValue: mode}],
        });
        fixture = TestBed.createComponent(Test);
        await render();
        button = fixture.nativeElement.querySelector('button');
    });

    async function render(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }

    it('preserves the Angular text node and updates graphemes when its signal changes', async () => {
        const original = button.querySelector('.t-motion-source')!.firstChild;

        mode.set('otus-brand');
        await render();
        fixture.componentInstance.label.set('Привет 👩‍🔬');
        await render();

        expect(button.querySelector('.t-motion-source')!.firstChild).toBe(original);
        expect(original!.textContent).toBe('Привет 👩‍🔬');
        expect(button.querySelectorAll('.t-motion-letter')).toHaveLength(8);
        expect(
            button
                .querySelector('.t-motion-letter:last-child')!
                .getAttribute('data-letter'),
        ).toBe('👩‍🔬');
    });

    it('restores the original content when motion is disabled', async () => {
        const original = button.querySelector('.t-motion-source')!.firstChild;

        mode.set('otus-brand');
        await render();
        mode.set('none');
        await render();

        expect(button.firstChild).toBe(original);
        expect(button.textContent).toBe('Continue');
        expect(button.querySelector('.t-motion-backdrop')).toBeNull();
        fixture.componentInstance.label.set('Updated');
        await render();
        expect(button.textContent).toBe('Updated');
    });
});
