import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiOtusColorMapping} from './color-mapping.component';

const meta = {
    title: 'Documentation/Styles/Colors/Taiga to Otus mapping',
    component: TuiOtusColorMapping,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiOtusColorMapping>;

export default meta;

export const Table: StoryObj<TuiOtusColorMapping> = {name: 'Маппинг цветов'};
