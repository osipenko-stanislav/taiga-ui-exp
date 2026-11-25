import * as React from 'react';
import {DocsContainer, type DocsContainerProps} from '@storybook/addon-docs/blocks';
import {GLOBALS_UPDATED} from 'storybook/internal/core-events';
import {themes} from 'storybook/theming';

export function OtusDocsContainer(
    props: React.PropsWithChildren<DocsContainerProps>,
): React.ReactElement {
    const first = props.context.componentStories()[0];
    const [dark, setDark] = React.useState(() =>
        first ? props.context.getStoryContext(first).globals.theme === 'dark' : false,
    );

    React.useEffect(() => {
        const update = ({globals}: {globals: Record<string, unknown>}): void =>
            setDark(globals.theme === 'dark');
        props.context.channel.on(GLOBALS_UPDATED, update);
        return () => {
            props.context.channel.off(GLOBALS_UPDATED, update);
        };
    }, [props.context]);

    return React.createElement(
        DocsContainer,
        {...props, theme: dark ? themes.dark : themes.light},
        props.children,
    );
}
