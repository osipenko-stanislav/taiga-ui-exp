import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    id: 'foundations-motion',
    title: 'Основы/Effects/Motion',
    component: TuiFoundationsStory,
    args: {section: 'motion'},
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

export const Tokens: StoryObj<TuiFoundationsStory> = {name: 'Motion'};
