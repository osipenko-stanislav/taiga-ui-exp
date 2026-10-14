import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiCheckboxStory} from './checkbox.component';

const meta = {
    id: 'components-checkbox',
    title: 'Form/Toggles/Checkbox/Controls',
    component: TuiCheckboxStory,
    tags: ['autodocs'],
    args: {
        label: 'Accept terms',
        checked: false,
        size: 'm',
        disabled: false,
        required: false,
        state: null,
        focus: null,
    },
    argTypes: {
        label: {control: 'text'},
        checked: {
            control: 'select',
            options: [false, true, null],
            description: 'null is the indeterminate state',
        },
        size: {control: 'select', options: ['s', 'm']},
        disabled: {control: 'boolean'},
        required: {
            control: 'boolean',
            description: 'Reactive form with requiredTrue validation',
        },
        state: {control: 'select', options: [null, 'hover', 'active', 'disabled']},
        focus: {control: 'select', options: [null, true, false]},
    },
} satisfies Meta<TuiCheckboxStory>;

export default meta;

type Story = StoryObj<TuiCheckboxStory>;

export const Playground: Story = {};
export const Checked: Story = {args: {checked: true}};
export const Indeterminate: Story = {args: {checked: null}};
export const Disabled: Story = {args: {disabled: true}};
export const DisabledChecked: Story = {args: {disabled: true, checked: true}};
export const Invalid: Story = {args: {required: true}};
export const Hover: Story = {args: {state: 'hover'}};
export const Active: Story = {args: {state: 'active'}};
export const Focus: Story = {args: {focus: true}};
