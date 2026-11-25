import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiGettingStartedStory} from './getting-started.component';

const meta = {
    title: 'Начало работы',
    component: TuiGettingStartedStory,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiGettingStartedStory>;

export default meta;

export const All: StoryObj<TuiGettingStartedStory> = {name: 'Как начать работать с OTUS'};
