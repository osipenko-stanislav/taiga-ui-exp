/// <reference lib="es2022.intl" />
import {DOCUMENT} from '@angular/common';
import {afterRenderEffect, DestroyRef, Directive, inject} from '@angular/core';
import {tuiInjectElement} from '@taiga-ui/cdk/utils/dom';

import {TUI_BUTTON_MOTION} from './button-motion';

interface ButtonLabel {
    readonly wrapper: HTMLElement;
    readonly source: HTMLElement;
    readonly letters: HTMLElement;
    text: string;
}

@Directive({
    host: {
        '(focusin)': 'refreshAppearance()',
        '(focusout)': 'refreshAppearance()',
        '(keydown)': 'refreshAppearance()',
        '(keyup)': 'refreshAppearance()',
        '(pointerdown)': 'refreshAppearance()',
        '(pointerenter)': 'refreshAppearance()',
        '(pointerleave)': 'refreshAppearance()',
        '(pointerup)': 'refreshAppearance()',
    },
})
export class TuiButtonMotion {
    private readonly element = tuiInjectElement();
    private readonly doc = inject(DOCUMENT);
    private readonly mode = inject(TUI_BUTTON_MOTION);
    private readonly labels = new Map<Text, ButtonLabel>();
    private backdrop: HTMLElement | null = null;
    private observer: MutationObserver | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private segmenter: Intl.Segmenter | null = null;

    constructor() {
        afterRenderEffect(() => {
            if (this.mode() === 'none') {
                this.reset();

                return;
            }

            this.observer ??= new MutationObserver(() => this.refresh());
            this.resizeObserver ??= new ResizeObserver(() => this.refresh());
            this.refresh();
        });
        inject(DestroyRef).onDestroy(() => this.reset());
    }

    protected refreshAppearance(): void {
        if (!this.backdrop) {
            return;
        }

        this.observer?.disconnect();
        this.paint();
        this.observe();
    }

    private refresh(): void {
        this.observer?.disconnect();

        if (!this.backdrop) {
            this.backdrop = this.createSpan('t-motion-backdrop');
            this.backdrop.setAttribute('aria-hidden', 'true');
        }

        this.element.classList.add('t-motion-button');
        this.element.setAttribute('data-button-motion', this.mode());
        this.updateLabels();
        this.paint();

        if (!this.backdrop.parentElement) {
            this.element.prepend(this.backdrop);
        }

        this.observe();
    }

    private paint(): void {
        // Read the original appearance synchronously, before the browser paints.
        // This also preserves custom appearances and styles applied by consumers.
        this.element.classList.add('t-motion-measure');
        const styles = this.doc.defaultView!.getComputedStyle(this.element);

        this.backdrop!.style.background = styles.background;
        this.backdrop!.style.boxShadow = styles.boxShadow;
        this.element.classList.remove('t-motion-measure');
        const state = this.element.getAttribute('data-state');
        const disabled =
            this.element.matches(':disabled, [aria-disabled="true"]') ||
            this.element.classList.contains('_loading') ||
            state === 'disabled';

        const focus = this.element.getAttribute('data-focus');
        const focused =
            focus === 'true' ||
            (focus !== 'false' && this.element.matches(':focus-visible'));

        this.element.classList.toggle(
            't-motion-hover',
            !disabled &&
                (state === 'hover' ||
                    (!state && (this.element.matches(':hover') || focused))),
        );
    }

    private updateLabels(): void {
        for (const [node, label] of this.labels) {
            if (!this.element.contains(node)) {
                label.wrapper.remove();
                this.resizeObserver?.unobserve(label.source);
                this.labels.delete(node);
            }
        }

        const walker = this.doc.createTreeWalker(this.element, NodeFilter.SHOW_TEXT);
        const nodes: Text[] = [];

        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node as Text;

            if (
                text.textContent?.trim() &&
                !text.parentElement?.closest(
                    '.t-motion-label, .t-loader, tui-icon, svg, [aria-hidden="true"], [contenteditable]',
                )
            ) {
                nodes.push(text);
            }
        }

        for (const node of nodes) {
            const wrapper = this.createSpan('t-motion-label');
            const source = this.createSpan('t-motion-source');
            const letters = this.createSpan('t-motion-letters');

            letters.setAttribute('aria-hidden', 'true');
            node.before(wrapper);
            source.append(node);
            wrapper.append(source, letters);
            this.labels.set(node, {wrapper, source, letters, text: ''});
            this.resizeObserver?.observe(source);
        }

        for (const [node, label] of this.labels) {
            const text = node.textContent?.trim() ?? '';

            if (this.mode() !== 'otus-brand') {
                label.letters.replaceChildren();
                label.text = '';

                continue;
            }

            if (text === label.text) {
                this.layoutLetters(node, label);
                continue;
            }

            this.segmenter ??= new Intl.Segmenter(undefined, {granularity: 'grapheme'});
            const letters = Array.from(
                this.segmenter.segment(text),
                ({segment}, index) => {
                    const letter = this.createSpan('t-motion-letter');

                    letter.setAttribute('data-letter', segment);
                    letter.setAttribute('data-roll-label', text);
                    letter.style.transitionDelay = `${Math.min(index / 150, 0.2)}s`;

                    return letter;
                },
            );

            label.letters.replaceChildren(...letters);
            label.text = text;
            this.layoutLetters(node, label);
        }
    }

    private layoutLetters(node: Text, label: ButtonLabel): void {
        const source = label.source.getBoundingClientRect();
        const range = this.doc.createRange();
        const rtl =
            this.doc.defaultView!.getComputedStyle(label.source).direction === 'rtl';

        let offset = (node.textContent ?? '').indexOf(label.text);

        // Each slice renders the complete shaped string, preserving Core kerning
        // and ligatures instead of shaping individual characters independently.
        const positions = Array.from(label.letters.children, (letter) => {
            const length = letter.getAttribute('data-letter')!.length;

            range.setStart(node, offset);
            range.setEnd(node, offset + length);
            offset += length;
            const bounds = range.getBoundingClientRect();
            const start = rtl ? source.right - bounds.right : bounds.left - source.left;

            return {element: letter as HTMLElement, start, width: bounds.width};
        });

        for (const {element, start, width} of positions) {
            element.style.setProperty('--t-motion-offset', `${start}px`);
            element.style.setProperty('--t-motion-width', `${width}px`);
            element.style.setProperty('--t-motion-label-width', `${source.width}px`);
        }
    }

    private observe(): void {
        this.observer?.observe(this.element, {
            attributes: true,
            attributeFilter: [
                'class',
                'style',
                'disabled',
                'aria-disabled',
                'data-size',
                'data-appearance',
                'data-mode',
                'data-state',
                'data-focus',
            ],
            childList: true,
            characterData: true,
            subtree: true,
        });

        for (
            let parent = this.element.parentElement;
            parent;
            parent = parent.parentElement
        ) {
            this.observer?.observe(parent, {attributes: true});
        }
    }

    private createSpan(className: string): HTMLElement {
        const span = this.doc.createElement('span');

        span.className = className;

        return span;
    }

    private reset(): void {
        this.observer?.disconnect();
        this.resizeObserver?.disconnect();
        this.backdrop?.remove();
        this.backdrop = null;

        for (const [node, label] of this.labels) {
            if (label.source.contains(node)) {
                label.wrapper.replaceWith(node);
            }
        }

        this.labels.clear();
        this.element.classList.remove(
            't-motion-button',
            't-motion-hover',
            't-motion-measure',
        );
        this.element.removeAttribute('data-button-motion');
    }
}
