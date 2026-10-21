import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    id: 'foundations-colors',
    title: 'Documentation/Styles/Colors/Tokens',
    component: TuiFoundationsStory,
    args: {section: 'colors'},
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

export const Tokens: StoryObj<TuiFoundationsStory> = {name: 'Tokens'};
