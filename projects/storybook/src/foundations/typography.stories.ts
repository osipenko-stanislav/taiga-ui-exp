import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    id: 'foundations-typography',
    title: 'Documentation/Styles/Typography/Tokens',
    component: TuiFoundationsStory,
    args: {section: 'typography'},
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

export const Tokens: StoryObj<TuiFoundationsStory> = {name: 'Tokens'};
