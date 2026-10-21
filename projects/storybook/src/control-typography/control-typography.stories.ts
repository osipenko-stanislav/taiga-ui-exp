import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiControlTypography} from './control-typography.component';

const meta = {
    id: 'documentation-styles-control-typography',
    title: 'Documentation/Styles/Typography/Control typography',
    component: TuiControlTypography,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiControlTypography>;

export default meta;

export const Gallery: StoryObj<TuiControlTypography> = {name: 'Gallery'};
