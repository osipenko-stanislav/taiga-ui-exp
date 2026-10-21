import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiOtusDimensions} from './otus-dimensions.component';

const meta = {
    title: 'Documentation/Styles/Layout/Otus global dimensions',
    component: TuiOtusDimensions,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiOtusDimensions>;

export default meta;

export const Tokens: StoryObj<TuiOtusDimensions> = {name: 'Размерная шкала'};
