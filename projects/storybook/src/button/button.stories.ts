import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiButtonStory} from './button.component';

const meta = {
    id: 'components-button',
    title: 'Components/Buttons/Button/Controls',
    component: TuiButtonStory,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Кнопки: Graphik Medium, вес 500. XS и S: 14/20 px; M и L: 16/24 px. Заголовки: 600. Наборный текст: 400.',
            },
        },
    },
    args: {
        label: 'Continue',
        appearance: 'primary',
        size: 'l',
        disabled: false,
        loading: false,
        iconStart: '',
        iconEnd: '',
        state: null,
        focus: null,
    },
    argTypes: {
        label: {control: 'text'},
        appearance: {
            control: 'select',
            options: [
                'primary',
                'secondary',
                'secondary-grayscale',
                'outline',
                'outline-grayscale',
                'flat',
                'flat-grayscale',
                'accent',
                'destructive',
                'opposite',
            ],
        },
        size: {control: 'select', options: ['xs', 's', 'm', 'l']},
        disabled: {control: 'boolean'},
        loading: {control: 'boolean', description: 'TuiButtonLoading directive'},
        iconStart: {control: 'text'},
        iconEnd: {control: 'text'},
        state: {control: 'select', options: [null, 'hover', 'active', 'disabled']},
        focus: {control: 'select', options: [null, true, false]},
    },
} satisfies Meta<TuiButtonStory>;

export default meta;

type Story = StoryObj<TuiButtonStory>;

export const Playground: Story = {};
export const Secondary: Story = {args: {appearance: 'secondary'}};
export const Disabled: Story = {args: {disabled: true}};
export const Loading: Story = {args: {loading: true}};
export const WithIcons: Story = {
    args: {
        iconStart: '@otus.outline.plus-lined',
        iconEnd: '@otus.outline.arrow-right-lined',
    },
};

export const Hover: Story = {args: {state: 'hover'}};
export const Active: Story = {args: {state: 'active'}};
export const Focus: Story = {args: {focus: true}};
