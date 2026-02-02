/* eslint-disable react-hooks/refs */
import React from 'react';
import { throttle } from 'es-toolkit';

interface UseResizableObserverProps {
	initialWidth?: number;
	effectTriggers?: (number | string | boolean)[];
}

const SCROLL_BAR_WIDTH = 6;
const THROTTLE_TIME = 150;

function useResizableObserver<T extends HTMLElement>({ initialWidth = 300, effectTriggers = [] }: UseResizableObserverProps) {
	const [containerWidth, setContainerWidth] = React.useState<number>(initialWidth);

	const containerRef = React.useRef<T>(null);

	/**
	 * ⚡️ Change width depends on parent width
	 * box-sizing: border-box -> width: content + padding + border
	 * 
	 * offsetWidth - content + padding + border	px (number)	정수
		 clientWidth - content + padding	px (number)	정수
		 scrollWidth - content + padding + 스크롤 영역 포함	px (number)	정수
		 getComputedStyle(element).width - CSS상 width (box-sizing 영향 있음) "500px" (문자열) 소수점 가능
	 */

	const handleResize = () => {
		const target = containerRef.current;

		if (!target) return;

		// $element.getBoundingClientRect().width = padding + content width + border
		const { width } = target.getBoundingClientRect();

		const targetStyle = getComputedStyle(target);
		const paddingX = (parseFloat(targetStyle.paddingLeft) || 0) + (parseFloat(targetStyle.paddingRight) || 0);
		const borderWidth = parseFloat(targetStyle.borderWidth) || 0;

		const currentWidth = width - paddingX - 2 * SCROLL_BAR_WIDTH - 2 * borderWidth;

		setContainerWidth(prevWidth => (prevWidth !== currentWidth ? currentWidth : prevWidth));
	};

	const throttledResize = React.useMemo(() => throttle(handleResize, THROTTLE_TIME), [handleResize]);

	React.useLayoutEffect(() => {
		if (!containerRef.current) return;
		handleResize(); // SSR hydration 직후 바로 실제 width로 갱신
	}, []);

	// browser size effect
	React.useEffect(() => {
		if (!containerRef.current) return;

		handleResize();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [...effectTriggers]);

	// container resizing
	React.useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver(() => {
			requestAnimationFrame(() => {
				throttledResize();
			});
		});

		observer.observe(containerRef.current);

		return () => {
			observer.disconnect();
			throttledResize.cancel?.();
		};
	}, [throttledResize]);

	return { containerRef, containerWidth };
}

export { useResizableObserver, SCROLL_BAR_WIDTH };
