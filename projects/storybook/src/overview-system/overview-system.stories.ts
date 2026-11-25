import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiOverviewSystemStory} from './overview-system.component';

const meta = {
    title: 'Обзор системы',
    component: TuiOverviewSystemStory,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiOverviewSystemStory>;

export default meta;

export const All: StoryObj<TuiOverviewSystemStory> = {name: 'Возможности OTUS'};
