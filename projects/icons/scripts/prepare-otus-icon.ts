const MASK_STROKE_STYLE = `<style>
@media (min-aspect-ratio: 101/100) {
    [stroke-width] {
        stroke-width: calc((100vw - 100vh) / 10);
    }
    path, rect, circle, ellipse, line, polygon, polyline {
        vector-effect: non-scaling-stroke;
    }
}
</style>`;

export function tuiPrepareOtusIcon(svg: string): string {
    if (!svg.includes('stroke-width=')) {
        return svg;
    }

    // Taiga encodes --tui-stroke-width in the extra width of its SVG mask viewport.
    // Square image viewports retain the original stroke from the source asset.
    return svg.replace('</svg>', `${MASK_STROKE_STYLE}\n</svg>`);
}
