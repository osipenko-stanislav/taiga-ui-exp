# OTUS — Icons

Исходники SVG находятся в `assets/`:

- `outline/` — контурные иконки;
- `flat/` — залитые иконки;
- `level/` — уровни;
- `syntax/` — технологии.

Добавляйте новые иконки в соответствующую папку `assets/`. Папка `src/` генерируется и полностью пересоздаётся командой
`npx nx run icons:prepare-icons`. Storybook выполняет эту подготовку при запуске.

```html
<tui-icon icon="@otus.outline.search-md-lined" />
<button
  tuiButton
  iconStart="@otus.outline.plus-lined"
>
  Добавить
</button>
<tui-icon icon="@otus.flat.heart-filled" />
<tui-icon icon="@otus.level.Level-01-lined" />
<tui-icon icon="@otus.syntax.Angular-filled" />
```

Имена файлов сохраняются с учётом регистра. Точки после `@otus.` обозначают папки.

При подготовке SVG со stroke из Outline и Level получают поддержку `--tui-stroke-width` в компонентах Taiga. Исходники в
`assets/` сохраняют оригинальную толщину; обычное отображение квадратных SVG как изображений тоже сохраняется.

Встроенные иконки компонентов используют набор OTUS через стандартный `TUI_ICON_RESOLVER` библиотеки. Дополнительный
провайдер в приложении не нужен. Путь к SVG задаётся через `TUI_ASSETS_PATH`. Таблица совместимости со старыми именами
находится в `otus-icons.ts`; она направляет обращения к иконкам Taiga на SVG из наборов OTUS.
