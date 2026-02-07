import { throttle } from 'es-toolkit';
import React from 'react';

interface UseResizableObserverProps {
	initialWidth?: number;
	enabled?: boolean;
}

const THROTTLE_TIME = 150;

export function useResizableObserverInDialog<T extends HTMLElement>({ initialWidth = 300, enabled = true }: UseResizableObserverProps) {
	const containerRef = React.useRef<T | null>(null);
	const latestWidthRef = React.useRef<number>(initialWidth);
	const [containerWidth, setContainerWidth] = React.useState<number>(initialWidth);

	const applyWidth = (borderBoxWidth: number) => {
		const rounded = Math.max(0, Math.round(borderBoxWidth));
		if (latestWidthRef.current !== rounded) {
			latestWidthRef.current = rounded;
			setContainerWidth(rounded);
		}
	};

	React.useLayoutEffect(() => {
		if (!enabled) return;

		const containerElement = containerRef.current;
		if (!containerElement) return;

		applyWidth(containerElement.getBoundingClientRect().width);
	}, [enabled]);

	React.useEffect(() => {
		if (!enabled) return;

		const containerElement = containerRef.current;
		if (!containerElement) return;

		const throttledResize = throttle((width: number) => applyWidth(width), THROTTLE_TIME);

		const observer = new ResizeObserver(entries => {
			const entry = entries[0];
			if (!entry) return;

			const size = entry.borderBoxSize?.[0];
			const width = size ? size.inlineSize : containerElement.getBoundingClientRect().width;

			requestAnimationFrame(() => throttledResize(width));
		});

		observer.observe(containerElement, { box: 'border-box' });

		return () => {
			observer.disconnect();
			if (typeof throttledResize.cancel === 'function') {
				throttledResize.cancel?.();
			}
		};
	}, [enabled]);

	return { containerRef, containerWidth };
}
