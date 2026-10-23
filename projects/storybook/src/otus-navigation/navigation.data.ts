export interface TuiOtusNavigationLink {
    readonly title: string;
    readonly description: string;
    readonly icon: string;
}

export interface TuiOtusNavigationGroup {
    readonly title: string;
    readonly links: readonly TuiOtusNavigationLink[];
}

export interface TuiOtusNavigationMenu {
    readonly id: string;
    readonly title: string;
    readonly icon: string;
    readonly groups: readonly TuiOtusNavigationGroup[];
}

export const STUDENT_NAVIGATION: readonly TuiOtusNavigationMenu[] = [
    {
        id: 'navigator',
        title: 'Навигатор',
        icon: '@otus.outline.compass-03-lined',
        groups: [
            {
                title: 'Мой университет',
                links: [
                    {
                        title: 'Мой день',
                        description: 'Занятия, задачи и ближайшие события',
                        icon: '@otus.outline.compass-03-lined',
                    },
                    {
                        title: 'Расписание',
                        description: 'Все занятия на неделю',
                        icon: '@otus.outline.calendar-plus-02-lined',
                    },
                    {
                        title: 'Учебный план',
                        description: 'Дисциплины и траектория обучения',
                        icon: '@otus.outline.book-open-01-lined',
                    },
                ],
            },
            {
                title: 'Под рукой',
                links: [
                    {
                        title: 'Задания',
                        description: 'Что нужно сдать и в какой срок',
                        icon: '@otus.outline.check-done-01-lined',
                    },
                    {
                        title: 'Оценки',
                        description: 'Результаты и обратная связь',
                        icon: '@otus.outline.bar-chart-01-lined',
                    },
                    {
                        title: 'Избранное',
                        description: 'Сохранённые разделы и материалы',
                        icon: '@otus.outline.bookmark-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'study',
        title: 'Учеба',
        icon: '@otus.outline.book-open-01-lined',
        groups: [
            {
                title: 'Обучение',
                links: [
                    {
                        title: 'Мои дисциплины',
                        description: 'Курсы текущего семестра',
                        icon: '@otus.outline.book-open-01-lined',
                    },
                    {
                        title: 'Задания и дедлайны',
                        description: 'Работы, которые ждут решения',
                        icon: '@otus.outline.check-done-01-lined',
                    },
                    {
                        title: 'Результаты обучения',
                        description: 'Оценки по всем дисциплинам',
                        icon: '@otus.outline.bar-chart-01-lined',
                    },
                ],
            },
            {
                title: 'Развитие',
                links: [
                    {
                        title: 'Образовательная траектория',
                        description: 'Выбор направлений и дисциплин',
                        icon: '@otus.outline.compass-03-lined',
                    },
                    {
                        title: 'Библиотека',
                        description: 'Учебники и полезные материалы',
                        icon: '@otus.outline.book-open-01-lined',
                    },
                    {
                        title: 'Проектная работа',
                        description: 'Команды и проекты семестра',
                        icon: '@otus.outline.package-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'events',
        title: 'События',
        icon: '@otus.outline.announcement-01-lined',
        groups: [
            {
                title: 'В университете',
                links: [
                    {
                        title: 'Календарь событий',
                        description: 'Лекции, встречи и мастерские',
                        icon: '@otus.outline.calendar-plus-02-lined',
                    },
                    {
                        title: 'Мои регистрации',
                        description: 'События, на которые вы записались',
                        icon: '@otus.outline.bookmark-lined',
                    },
                ],
            },
            {
                title: 'Сообщество',
                links: [
                    {
                        title: 'Студенческие клубы',
                        description: 'Найти единомышленников',
                        icon: '@otus.outline.users-01-lined',
                    },
                    {
                        title: 'Новости университета',
                        description: 'Что происходит в ЦУ',
                        icon: '@otus.outline.announcement-01-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'services',
        title: 'Сервисы',
        icon: '@otus.outline.package-lined',
        groups: [
            {
                title: 'Для учёбы',
                links: [
                    {
                        title: 'Справки и документы',
                        description: 'Запросить документы онлайн',
                        icon: '@otus.outline.file-02-lined',
                    },
                    {
                        title: 'Бронирование аудиторий',
                        description: 'Место для командной работы',
                        icon: '@otus.outline.calendar-plus-02-lined',
                    },
                    {
                        title: 'Техническая поддержка',
                        description: 'Помощь с доступом и сервисами',
                        icon: '@otus.outline.message-chat-circle-lined',
                    },
                ],
            },
            {
                title: 'Для себя',
                links: [
                    {
                        title: 'Кампус',
                        description: 'Пространства и инфраструктура',
                        icon: '@otus.outline.compass-03-lined',
                    },
                    {
                        title: 'Забота о себе',
                        description: 'Поддержка и благополучие',
                        icon: '@otus.outline.heart-lined',
                    },
                    {
                        title: 'Обратная связь',
                        description: 'Поделиться идеей или проблемой',
                        icon: '@otus.outline.announcement-01-lined',
                    },
                ],
            },
        ],
    },
];

export const STUDENT_UTILITIES: readonly TuiOtusNavigationMenu[] = [
    {id: 'search', title: 'Поиск', icon: '@otus.outline.search-lg-lined', groups: []},
    {
        id: 'days',
        title: 'Дни опоздания',
        icon: '@otus.outline.calendar-plus-02-lined',
        groups: [
            {
                title: 'Осталось 32 дня',
                links: [
                    {
                        title: 'Как использовать дни',
                        description: 'Перенести срок сдачи задания',
                        icon: '@otus.outline.calendar-plus-02-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'notifications',
        title: 'Уведомления',
        icon: '@otus.outline.bell-04-lined',
        groups: [
            {
                title: 'Новое',
                links: [
                    {
                        title: 'Опубликовано новое задание',
                        description: 'Математический анализ · сегодня',
                        icon: '@otus.outline.book-open-01-lined',
                    },
                    {
                        title: 'Встреча с куратором',
                        description: 'Завтра в 16:00 · аудитория 304',
                        icon: '@otus.outline.calendar-plus-02-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'profile',
        title: 'Профиль',
        icon: '@otus.outline.user-01-lined',
        groups: [
            {
                title: 'Анна Смирнова · студент',
                links: [
                    {
                        title: 'Мой профиль',
                        description: 'Личные данные и контакты',
                        icon: '@otus.outline.user-01-lined',
                    },
                    {
                        title: 'Настройки',
                        description: 'Уведомления и предпочтения',
                        icon: '@otus.outline.settings-01-lined',
                    },
                ],
            },
        ],
    },
];

export const BOOKMARKS: TuiOtusNavigationMenu = {
    id: 'bookmarks',
    title: 'Избранное',
    icon: '@otus.outline.bookmark-lined',
    groups: [
        {
            title: 'Сохранённое',
            links: [
                {
                    title: 'Расписание',
                    description: 'Быстрый доступ к занятиям',
                    icon: '@otus.outline.calendar-plus-02-lined',
                },
                {
                    title: 'Библиотека',
                    description: 'Материалы для учёбы',
                    icon: '@otus.outline.book-open-01-lined',
                },
            ],
        },
    ],
};

export type TuiOtusNavigationZone = 'applicant' | 'employee' | 'public' | 'student';
export type TuiOtusNavigationSize = 'l' | 'm' | 's';

export interface TuiOtusNavigationPreset {
    readonly title: string;
    readonly menus: readonly TuiOtusNavigationMenu[];
    readonly utilities: readonly TuiOtusNavigationMenu[];
    readonly bookmarks: boolean;
}

const notifications = STUDENT_UTILITIES.find((menu) => menu.id === 'notifications')!;
const search = STUDENT_UTILITIES.find((menu) => menu.id === 'search')!;

const language: TuiOtusNavigationMenu = {
    id: 'language',
    title: 'Язык',
    icon: '@otus.outline.globe-02-lined',
    groups: [
        {
            title: 'Язык интерфейса',
            links: [
                {
                    title: 'Русский',
                    description: 'RU',
                    icon: '@otus.outline.globe-02-lined',
                },
                {
                    title: 'English',
                    description: 'EN',
                    icon: '@otus.outline.globe-02-lined',
                },
            ],
        },
    ],
};

const applicant: readonly TuiOtusNavigationMenu[] = [
    {id: 'home', title: 'Главная', icon: '', groups: []},
    {id: 'grant', title: 'Грантовый конкурс', icon: '', groups: []},
    {id: 'admission', title: 'Поступление', icon: '', groups: []},
    {id: 'events', title: 'Мероприятия', icon: '', groups: []},
    {
        id: 'more',
        title: 'Ещё',
        icon: '',
        groups: [
            {
                title: 'Другие разделы',
                links: [
                    {
                        title: 'Документы',
                        description: 'Заявления и справки',
                        icon: '@otus.outline.file-02-lined',
                    },
                    {
                        title: 'Помощь',
                        description: 'Вопросы о поступлении',
                        icon: '@otus.outline.message-chat-circle-lined',
                    },
                ],
            },
        ],
    },
];

const employee: readonly TuiOtusNavigationMenu[] = [
    {
        id: 'workspace',
        title: 'Работа',
        icon: '@otus.outline.briefcase-01-lined',
        groups: [
            {
                title: 'Мой день',
                links: [
                    {
                        title: 'Задачи',
                        description: 'Текущие задачи и поручения',
                        icon: '@otus.outline.check-done-01-lined',
                    },
                    {
                        title: 'Календарь',
                        description: 'Встречи и события',
                        icon: '@otus.outline.calendar-plus-02-lined',
                    },
                ],
            },
            {
                title: 'Команда',
                links: [
                    {
                        title: 'Сотрудники',
                        description: 'Коллеги и контакты',
                        icon: '@otus.outline.users-01-lined',
                    },
                    {
                        title: 'Проекты',
                        description: 'Совместная работа',
                        icon: '@otus.outline.package-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'university',
        title: 'Университет',
        icon: '@otus.outline.announcement-01-lined',
        groups: [
            {
                title: 'Внутри ЦУ',
                links: [
                    {
                        title: 'Новости',
                        description: 'Объявления университета',
                        icon: '@otus.outline.announcement-01-lined',
                    },
                    {
                        title: 'База знаний',
                        description: 'Инструкции и регламенты',
                        icon: '@otus.outline.book-open-01-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'services',
        title: 'Сервисы',
        icon: '@otus.outline.package-lined',
        groups: [
            {
                title: 'Для работы',
                links: [
                    {
                        title: 'Документы',
                        description: 'Заявления и согласования',
                        icon: '@otus.outline.file-02-lined',
                    },
                    {
                        title: 'Поддержка',
                        description: 'Помощь с сервисами',
                        icon: '@otus.outline.message-chat-circle-lined',
                    },
                ],
            },
        ],
    },
];

function profile(title: string): TuiOtusNavigationMenu {
    return {
        id: 'profile',
        title: 'Профиль',
        icon: '@otus.outline.user-01-lined',
        groups: [
            {
                title,
                links: [
                    {
                        title: 'Мой профиль',
                        description: 'Личные данные и контакты',
                        icon: '@otus.outline.user-01-lined',
                    },
                    {
                        title: 'Настройки',
                        description: 'Уведомления и предпочтения',
                        icon: '@otus.outline.settings-01-lined',
                    },
                ],
            },
        ],
    };
}

const publicNavigation: readonly TuiOtusNavigationMenu[] = [
    {
        id: 'bachelor',
        title: 'Бакалавриат',
        icon: '@otus.outline.graduation-hat-02-lined',
        groups: [
            {
                title: 'Программы',
                links: [
                    {
                        title: 'Технологии',
                        description: 'Разработка, ИИ, бизнес и аналитика',
                        icon: '@otus.outline.package-lined',
                    },
                    {
                        title: 'Дизайн',
                        description: 'Программы Школы дизайна',
                        icon: '@otus.outline.compass-03-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'master',
        title: 'Магистратура',
        icon: '@otus.outline.book-open-01-lined',
        groups: [
            {
                title: 'Школы',
                links: [
                    {
                        title: 'Технологии',
                        description: 'Программы магистратуры',
                        icon: '@otus.outline.package-lined',
                    },
                    {
                        title: 'Дизайн',
                        description: 'Программы магистратуры',
                        icon: '@otus.outline.compass-03-lined',
                    },
                    {
                        title: 'Естественные науки',
                        description: 'ИИ в биотехе',
                        icon: '@otus.outline.book-open-01-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'executive',
        title: 'Обучение руководителей',
        icon: '@otus.outline.briefcase-01-lined',
        groups: [
            {
                title: 'Программы',
                links: [
                    {
                        title: 'ИИ для руководителей',
                        description: '',
                        icon: '@otus.outline.package-lined',
                    },
                    {
                        title: 'Как управлять руководителями',
                        description: '',
                        icon: '@otus.outline.users-01-lined',
                    },
                ],
            },
        ],
    },
    {
        id: 'events',
        title: 'Мероприятия',
        icon: '@otus.outline.calendar-plus-02-lined',
        groups: [],
    },
    {
        id: 'about',
        title: 'Об университете',
        icon: '@otus.outline.compass-03-lined',
        groups: [],
    },
];

export const NAVIGATION_PRESETS = {
    public: {title: 'Сайт', menus: publicNavigation, utilities: [], bookmarks: false},
    applicant: {
        title: 'Абитуриент',
        menus: applicant,
        utilities: [language, notifications, profile('Абитуриент')],
        bookmarks: false,
    },
    student: {
        title: 'Студент',
        menus: STUDENT_NAVIGATION,
        utilities: STUDENT_UTILITIES,
        bookmarks: true,
    },
    employee: {
        title: 'Сотрудник',
        menus: employee,
        utilities: [search, notifications, profile('Сотрудник')],
        bookmarks: true,
    },
} satisfies Record<TuiOtusNavigationZone, TuiOtusNavigationPreset>;

export interface TuiOtusToolGroup {
    readonly id: string;
    readonly title: string;
    readonly icon: string;
    readonly items: readonly string[];
}

export const TOOL_GROUPS: readonly TuiOtusToolGroup[] = [
    {
        id: 'users',
        title: 'Пользователи',
        icon: '@otus.outline.users-01-lined',
        items: ['Абитуриенты', 'Студенты', 'Преподаватели', 'Сотрудники', 'Роли'],
    },
    {
        id: 'groups',
        title: 'Группы',
        icon: '@otus.outline.users-01-lined',
        items: ['Активные группы', 'Архивные группы', 'Неполный состав'],
    },
    {
        id: 'event-builder',
        title: 'Event builder',
        icon: '@otus.outline.announcement-01-lined',
        items: ['Мероприятия', 'Архив'],
    },
    {
        id: 'certificates',
        title: 'Сертификаты',
        icon: '@otus.outline.award-01-lined',
        items: [],
    },
    {
        id: 'news',
        title: 'Новости',
        icon: '@otus.outline.announcement-01-lined',
        items: ['Архив', 'Теги', 'Спикеры'],
    },
    {
        id: 'grants',
        title: 'Гранты',
        icon: '@otus.outline.award-01-lined',
        items: ['Обладатели гранта', 'Апелляции'],
    },
    {
        id: 'documents',
        title: 'Документы',
        icon: '@otus.outline.file-02-lined',
        items: ['События с документами', 'Типы документов'],
    },
    {
        id: 'interviews',
        title: 'Сервис собеседований',
        icon: '@otus.outline.message-chat-circle-lined',
        items: ['Собеседующие', 'Таймслоты', 'Собеседования', 'Абитуриенты', 'Настройки'],
    },
    {
        id: 'schedule',
        title: 'Расписание',
        icon: '@otus.outline.calendar-plus-02-lined',
        items: ['Загруженность аудиторий', 'Активности', 'Пары'],
    },
    {
        id: 'communications',
        title: 'Коммуникации',
        icon: '@otus.outline.message-chat-circle-lined',
        items: ['Почтовые рассылки', 'Пуш-уведомления', 'SMS', 'Статистика'],
    },
    {
        id: 'education',
        title: 'Учебные процессы',
        icon: '@otus.outline.graduation-hat-02-lined',
        items: [
            'Учебные планы',
            'Название УП',
            'Блоки дисциплин',
            'Дисциплины',
            'Выбор курсов',
            'Кампании',
            'Загрузка пользователей',
            'РПД',
            'Банк компетенций',
        ],
    },
    {
        id: 'dean',
        title: 'Деканат',
        icon: '@otus.outline.folder-lined',
        items: ['Приказы'],
    },
    {
        id: 'forms',
        title: 'Конструктор форм',
        icon: '@otus.outline.file-02-lined',
        items: [],
    },
    {
        id: 'event-management',
        title: 'Организация мероприятий',
        icon: '@otus.outline.calendar-plus-02-lined',
        items: [],
    },
    {
        id: 'late-days',
        title: 'Late days',
        icon: '@otus.outline.calendar-plus-02-lined',
        items: [],
    },
    {
        id: 'workforce',
        title: 'Кадровое планирование',
        icon: '@otus.outline.briefcase-01-lined',
        items: [],
    },
    {
        id: 'rates',
        title: 'Ставки сотрудников',
        icon: '@otus.outline.wallet-03-lined',
        items: [],
    },
    {
        id: 'activities',
        title: 'Активности',
        icon: '@otus.outline.calendar-plus-02-lined',
        items: [],
    },
    {
        id: 'headcount',
        title: 'Численность сотрудников',
        icon: '@otus.outline.users-01-lined',
        items: [],
    },
    {id: 'tracks', title: 'Траектории', icon: '@otus.outline.route-lined', items: []},
    {
        id: 'transcript',
        title: 'Транскрипт',
        icon: '@otus.outline.file-02-lined',
        items: [],
    },
    {id: 'balance', title: 'Баланс', icon: '@otus.outline.wallet-03-lined', items: []},
];
