import {NgComponentOutlet} from '@angular/common';
import {ChangeDetectionStrategy, Component, input, type Type} from '@angular/core';

@Component({
    selector: 'tui-example-story',
    imports: [NgComponentOutlet],
    templateUrl: './example.component.html',
    styleUrl: './example.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: 'Pythons',
            useFactory: () => [
                'John Cleese',
                'Eric Idle',
                'Michael Palin',
                'Graham Chapman',
                'Terry Gilliam',
                'Terry Jones',
            ],
        },
    ],
})
export class TuiExampleStory {
    public readonly example = input.required<Type<unknown>>();
}
