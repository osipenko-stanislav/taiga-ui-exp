import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    id: 'foundations-dimensions',
    title: 'Documentation/Styles/Layout/Sizes and radii',
    component: TuiFoundationsStory,
    args: {section: 'dimensions'},
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

export const Tokens: StoryObj<TuiFoundationsStory> = {name: 'Sizes and radii'};
