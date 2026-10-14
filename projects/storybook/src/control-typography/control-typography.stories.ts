import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiControlTypography} from './control-typography.component';

const meta = {
    title: 'Documentation/Styles/Control Typography',
    component: TuiControlTypography,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiControlTypography>;

export default meta;

export const Gallery: StoryObj<TuiControlTypography> = {name: 'Gallery'};
