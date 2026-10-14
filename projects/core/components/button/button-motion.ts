import {InjectionToken, type Signal, signal} from '@angular/core';

export type TuiButtonMotionMode = 'none' | 'otus-brand' | 'otus-core';

export const TUI_BUTTON_MOTION = new InjectionToken<Signal<TuiButtonMotionMode>>(
    'TUI_BUTTON_MOTION',
    {factory: () => signal<TuiButtonMotionMode>('otus-core').asReadonly()},
);
