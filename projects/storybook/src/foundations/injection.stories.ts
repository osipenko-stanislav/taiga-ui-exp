import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    id: 'foundations-injection',
    title: 'Основы/Настройка/Injection tokens',
    component: TuiFoundationsStory,
    args: {section: 'injection'},
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

export const Tokens: StoryObj<TuiFoundationsStory> = {name: 'Injection tokens'};
