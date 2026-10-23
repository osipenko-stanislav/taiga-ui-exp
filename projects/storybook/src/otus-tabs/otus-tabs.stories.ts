import {type Meta, type StoryObj} from '@storybook/angular';

import {TuiOtusTabsStory} from './otus-tabs.component';

const meta = {
    title: 'Navigation/Tabs/OTUS experimental',
    component: TuiOtusTabsStory,
    args: {size: 'l'},
    parameters: {
        controls: {disable: true},
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/yJH0kLE9Wh0OCD1LRaa9I0/?node-id=1935-5320',
        },
    },
} satisfies Meta<TuiOtusTabsStory>;

export default meta;

export const Playground: StoryObj<TuiOtusTabsStory> = {name: 'Табы и таблиния'};
