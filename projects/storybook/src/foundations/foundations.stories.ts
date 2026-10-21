import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    id: 'foundations-tokens',
    title: 'Documentation/Styles/CSS tokens',
    component: TuiFoundationsStory,
    args: {section: 'other'},
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

export const Other: StoryObj<TuiFoundationsStory> = {name: 'Other CSS tokens'};
