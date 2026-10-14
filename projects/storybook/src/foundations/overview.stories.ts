import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    title: 'Overview/Catalog',
    component: TuiFoundationsStory,
    args: {section: 'overview'},
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

export const All: StoryObj<TuiFoundationsStory> = {name: 'Все компоненты'};
