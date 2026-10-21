import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiOtusBrandColors} from './brand-colors.component';

const meta = {
    id: 'documentation-styles-otus-global-colors',
    title: 'Documentation/Styles/Colors/Otus global colors',
    component: TuiOtusBrandColors,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiOtusBrandColors>;

export default meta;

export const Palette: StoryObj<TuiOtusBrandColors> = {name: 'Брендовая палитра'};
