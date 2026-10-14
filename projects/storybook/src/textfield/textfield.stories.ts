import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiTextfieldStory} from './textfield.component';

const meta = {
    id: 'components-textfield',
    title: 'Form/Inputs/Input/Controls',
    component: TuiTextfieldStory,
    tags: ['autodocs'],
    args: {
        label: 'Technology',
        placeholder: 'Enter a value',
        value: '',
        size: 'l',
        appearance: 'textfield',
        cleaner: true,
        disabled: false,
        readonly: false,
        invalid: null,
        iconStart: '',
        iconEnd: '',
        state: null,
        focus: null,
        dropdown: false,
    },
    argTypes: {
        label: {control: 'text'},
        placeholder: {control: 'text'},
        value: {control: 'text'},
        size: {control: 'select', options: ['s', 'm', 'l']},
        appearance: {control: 'text'},
        cleaner: {control: 'boolean'},
        disabled: {control: 'boolean'},
        readonly: {control: 'boolean'},
        invalid: {control: 'select', options: [null, true, false]},
        iconStart: {control: 'text'},
        iconEnd: {control: 'text'},
        state: {control: 'select', options: [null, 'hover', 'active', 'disabled']},
        focus: {control: 'select', options: [null, true, false]},
        dropdown: {
            control: 'boolean',
            description: 'Focus the field and press ArrowDown to open suggestions',
        },
    },
} satisfies Meta<TuiTextfieldStory>;

export default meta;

type Story = StoryObj<TuiTextfieldStory>;

export const Playground: Story = {};
export const Filled: Story = {args: {value: 'Angular'}};
export const Disabled: Story = {args: {disabled: true, value: 'Angular'}};
export const Readonly: Story = {args: {readonly: true, value: 'Angular'}};
export const Invalid: Story = {args: {invalid: true, value: 'Unknown'}};
export const Valid: Story = {args: {invalid: false, value: 'Angular'}};
export const Focus: Story = {args: {focus: true}};
export const WithIcons: Story = {
    args: {
        iconStart: '@otus.outline.search-md-lined',
        iconEnd: '@otus.outline.settings-01-lined',
    },
};

export const WithDropdown: Story = {
    args: {dropdown: true, iconEnd: '@otus.outline.chevron-down-lined'},
};
