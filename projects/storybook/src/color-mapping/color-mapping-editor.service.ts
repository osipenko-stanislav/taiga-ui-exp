import {DOCUMENT} from '@angular/common';
import {computed, effect, inject, Injectable, signal} from '@angular/core';

import {
    applyColorOverrides,
    type ColorOverride,
    validateColorOverrides,
} from '../../../styles/scripts/otus-color-overrides.mjs';
import {OTUS_COLOR_MAPPING} from '../generated/catalog';

const STORAGE_KEY = 'otus-color-mapping-draft-v1';

@Injectable({providedIn: 'root'})
export class TuiColorMappingEditor {
    private readonly doc = inject(DOCUMENT);
    private readonly changes = signal<readonly ColorOverride[]>(this.restore());

    public readonly overrides = this.changes.asReadonly();
    public readonly storageError = signal('');
    public readonly previewEnabled = signal(true);
    public readonly mapping = computed(() =>
        this.changes().length
            ? applyColorOverrides(OTUS_COLOR_MAPPING, this.changes())
            : OTUS_COLOR_MAPPING,
    );

    constructor() {
        effect(() => {
            try {
                const storage = this.doc.defaultView?.localStorage;

                if (this.changes().length) {
                    storage?.setItem(STORAGE_KEY, JSON.stringify(this.changes()));
                } else {
                    storage?.removeItem(STORAGE_KEY);
                }
            } catch {
                this.storageError.set(
                    'Браузер не разрешает сохранять черновик. Скачайте JSON перед закрытием страницы.',
                );
            }
        });
    }

    public set(change: ColorOverride): void {
        validateColorOverrides(OTUS_COLOR_MAPPING, [change]);
        const original = OTUS_COLOR_MAPPING.mappings.find(
            (row) => row.tui === change.token,
        )!.variants[change.theme].schools[change.school];

        this.changes.update((entries) => [
            ...entries.filter((entry) => !this.matches(entry, change)),
            ...(original.primitive === change.primitive ? [] : [change]),
        ]);
    }

    public reset(change?: ColorOverride): void {
        this.changes.update((entries) =>
            change ? entries.filter((entry) => !this.matches(entry, change)) : [],
        );
    }

    private restore(): readonly ColorOverride[] {
        try {
            const stored = this.doc.defaultView?.localStorage.getItem(STORAGE_KEY);

            return stored
                ? validateColorOverrides(OTUS_COLOR_MAPPING, JSON.parse(stored))
                : [];
        } catch {
            return [];
        }
    }

    private matches(first: ColorOverride, second: ColorOverride): boolean {
        return (
            first.token === second.token &&
            first.school === second.school &&
            first.theme === second.theme
        );
    }
}
