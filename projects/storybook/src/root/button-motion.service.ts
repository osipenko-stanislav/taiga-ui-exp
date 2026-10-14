import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TuiStorybookButtonMotion {
    private readonly direction = signal<'otus-brand' | 'otus-core'>('otus-core');

    public readonly mode = this.direction.asReadonly();

    public setMode(mode: 'otus-brand' | 'otus-core'): void {
        this.direction.set(mode);
    }
}
