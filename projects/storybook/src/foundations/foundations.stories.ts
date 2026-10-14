import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiFoundationsStory} from './foundations.component';

const meta = {
    id: 'foundations-tokens',
    title: 'Documentation/Styles/Tokens',
    component: TuiFoundationsStory,
    parameters: {controls: {disable: true}},
} satisfies Meta<TuiFoundationsStory>;

export default meta;

type Story = StoryObj<TuiFoundationsStory>;

export const Colors: Story = {name: 'Цвета и градиенты', args: {section: 'colors'}};
export const Typography: Story = {
    name: 'Типографика · Graphik',
    args: {section: 'typography'},
};

export const Dimensions: Story = {
    name: 'Размеры и скругления',
    args: {section: 'dimensions'},
};

export const Shadows: Story = {name: 'Тени', args: {section: 'shadows'}};
export const Motion: Story = {name: 'Анимация', args: {section: 'motion'}};
export const Other: Story = {name: 'Остальные CSS-токены', args: {section: 'other'}};
export const Injection: Story = {name: 'Angular DI', args: {section: 'injection'}};
export const Icons: Story = {name: 'Иконки', args: {section: 'icons'}};
