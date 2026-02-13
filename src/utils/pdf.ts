import type { PageItem } from '@/components';

const getInitialWidth = ({ mediaQuery, maxSize = 800 }: { mediaQuery: boolean; maxSize?: number }) => {
	return typeof window !== 'undefined' ? (mediaQuery ? 300 : Math.min(window.innerWidth * 0.5, maxSize)) : 300;
};

function getRotationAngle({ page, factor }: { page: PageItem; factor: 'right' | 'left' }) {
	const currentRotation = page.rotation || 0;
	const delta = factor === 'right' ? 90 : -90;
	return (currentRotation + delta + 360) % 360;
}

export { getInitialWidth, getRotationAngle };
