import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiOtusNavigationStory} from './navigation.component';

const meta = {
    title: 'Navigation/Otus experiment',
    component: TuiOtusNavigationStory,
    tags: ['autodocs'],
    args: {
        zone: 'student',
        size: 'm',
        layout: 'header',
        sidebarExpanded: true,
        showSearch: true,
        showNotifications: true,
        showLanguage: true,
    },
    argTypes: {
        toolGroups: {name: 'Группы инструментов', control: 'object'},
        configurable: {name: 'Настройки на странице', control: 'boolean'},
        zone: {
            name: 'Зона',
            control: 'select',
            options: ['public', 'applicant', 'student', 'employee'],
        },
        size: {
            name: 'Размер кнопок',
            control: 'select',
            options: ['s', 'm', 'l'],
            description: 'Нативные размеры Taiga: S — 32 px, M — 44 px, L — 56 px.',
        },
        layout: {name: 'Расположение', control: 'select', options: ['header', 'sidebar']},
        sidebarExpanded: {name: 'Сайдбар раскрыт', control: 'boolean'},
        showSearch: {name: 'Поиск', control: 'boolean'},
        showNotifications: {name: 'Уведомления', control: 'boolean'},
        showLanguage: {name: 'Язык', control: 'boolean'},
        configuration: {
            name: 'Состав навигации',
            control: 'object',
            description:
                'Необязательная конфигурация вместо стандартного пресета: title, menus, utilities, bookmarks.',
        },
    },
} satisfies Meta<TuiOtusNavigationStory>;

export default meta;

type Story = StoryObj<TuiOtusNavigationStory>;

export const Playground: Story = {
    name: 'Настройка навигации',
    args: {configurable: true},
};

export const Public: Story = {
    name: 'Сайт · без авторизации',
    args: {zone: 'public'},
    parameters: {design: {type: 'link', url: 'https://cu.ru/'}},
};

export const Applicant: Story = {
    name: 'Абитуриент',
    args: {zone: 'applicant'},
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/yJH0kLE9Wh0OCD1LRaa9I0/?node-id=7965-7678',
        },
    },
};

export const Student: Story = {
    name: 'Студент',
    args: {zone: 'student'},
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/r8stDCVaU8oR9yflSTl9GR/?node-id=1904-8579',
        },
    },
};

export const Employee: Story = {name: 'Сотрудник', args: {zone: 'employee'}};
export const Tools: Story = {
    name: 'Сервисы и инструменты · сайдбар',
    args: {zone: 'employee', layout: 'sidebar'},
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/a1mIW2dzvDAcWo4jk24DgW/?node-id=811-15409',
        },
    },
};
