import React from 'react';
import { throttle } from 'es-toolkit';

interface UseResizableObserverProps {
	initialWidth?: number;
}

const SCROLL_BAR_WIDTH = 6;
const THROTTLE_TIME = 150;

function useResizableObserver<T extends HTMLElement>({ initialWidth = 300 }: UseResizableObserverProps) {
	const containerRef = React.useRef<T | null>(null);
	const latestWidthRef = React.useRef(initialWidth);
	const [containerWidth, setContainerWidth] = React.useState(initialWidth);

	const applyWidth = React.useCallback((borderBoxWidth: number) => {
		const contentWidth = borderBoxWidth - SCROLL_BAR_WIDTH;
		const roundedValue = Math.max(0, Math.round(contentWidth));

		if (latestWidthRef.current !== roundedValue) {
			latestWidthRef.current = roundedValue;
			setContainerWidth(roundedValue);
		}
	}, []);

	React.useLayoutEffect(() => {
		const containerElement = containerRef.current;
		if (!containerElement) return;

		const width = containerElement.getBoundingClientRect().width;

		applyWidth(width);
	}, [applyWidth]);

	React.useEffect(() => {
		const containerElement = containerRef.current;
		if (!containerElement) return;

		const throttledResize = throttle((width: number) => {
			applyWidth(width);
		}, THROTTLE_TIME);

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
				throttledResize.cancel();
			}
		};
	}, [applyWidth]);

	return { containerRef, containerWidth };
}

export { useResizableObserver, SCROLL_BAR_WIDTH };
