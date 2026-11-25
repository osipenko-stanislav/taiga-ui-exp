import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiOtusColorMapping} from './color-mapping.component';

const meta = {
    id: 'documentation-styles-colors-taiga-to-otus-mapping',
    title: 'Основы/Цвета/Маппинг цветов',
    component: TuiOtusColorMapping,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiOtusColorMapping>;

export default meta;

export const Table: StoryObj<TuiOtusColorMapping> = {name: 'Маппинг цветов'};
