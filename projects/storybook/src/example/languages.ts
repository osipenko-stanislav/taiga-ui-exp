import {type TuiLanguageName} from '@taiga-ui/i18n';

export const loadStorybookLanguage = async (
    language: TuiLanguageName,
): Promise<unknown> => {
    switch (language) {
        case 'arabic':
            return import('@taiga-ui/i18n/languages/arabic');
        case 'belarusian':
            return import('@taiga-ui/i18n/languages/belarusian');
        case 'chinese':
            return import('@taiga-ui/i18n/languages/chinese');
        case 'dutch':
            return import('@taiga-ui/i18n/languages/dutch');
        case 'english':
            return import('@taiga-ui/i18n/languages/english');
        case 'french':
            return import('@taiga-ui/i18n/languages/french');
        case 'german':
            return import('@taiga-ui/i18n/languages/german');
        case 'greek':
            return import('@taiga-ui/i18n/languages/greek');
        case 'hebrew':
            return import('@taiga-ui/i18n/languages/hebrew');
        case 'italian':
            return import('@taiga-ui/i18n/languages/italian');
        case 'japanese':
            return import('@taiga-ui/i18n/languages/japanese');
        case 'kazakh':
            return import('@taiga-ui/i18n/languages/kazakh');
        case 'korean':
            return import('@taiga-ui/i18n/languages/korean');
        case 'lithuanian':
            return import('@taiga-ui/i18n/languages/lithuanian');
        case 'malay':
            return import('@taiga-ui/i18n/languages/malay');
        case 'polish':
            return import('@taiga-ui/i18n/languages/polish');
        case 'portuguese':
            return import('@taiga-ui/i18n/languages/portuguese');
        case 'russian':
            return import('@taiga-ui/i18n/languages/russian');
        case 'spanish':
            return import('@taiga-ui/i18n/languages/spanish');
        case 'tajik':
            return import('@taiga-ui/i18n/languages/tajik');
        case 'turkish':
            return import('@taiga-ui/i18n/languages/turkish');
        case 'ukrainian':
            return import('@taiga-ui/i18n/languages/ukrainian');
        case 'vietnamese':
            return import('@taiga-ui/i18n/languages/vietnamese');
        default:
            return import('@taiga-ui/i18n/languages/english');
    }
};
