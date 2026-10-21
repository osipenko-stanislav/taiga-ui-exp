import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    id: 'foundations-icons',
    title: 'Documentation/Styles/Icons',
    component: TuiFoundationsStory,
    args: {section: 'icons'},
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

export const Gallery: StoryObj<TuiFoundationsStory> = {name: 'Icons'};
