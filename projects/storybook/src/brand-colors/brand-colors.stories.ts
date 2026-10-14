import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiOtusBrandColors} from './brand-colors.component';

const meta = {
    title: 'Documentation/Styles/OTUS Global Colors',
    component: TuiOtusBrandColors,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiOtusBrandColors>;

export default meta;

export const Palette: StoryObj<TuiOtusBrandColors> = {name: 'Брендовая палитра'};
