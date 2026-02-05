'use client';

import { useInView } from 'react-intersection-observer';
import { Page } from 'react-pdf';
import { AnimateSpinner, type PageItem } from '@/components';
import { DEVICE_PIXEL_RATIO, screenSize } from '@/constants';
import { useMediaQuery } from '@/hooks';

interface VirtualPageProps {
	page: PageItem;
	style: React.CSSProperties;
	pageNumber: number;
	startPageNumber: number;
	containerWidth: number;
}

function Skeleton({ height }: { height?: React.CSSProperties['height'] }) {
	return (
		<div style={{ height }} className="ui-flex-center w-full bg-light rounded-lg">
			<AnimateSpinner size={18} />
		</div>
	);
}

export default function VirtualPage({ page, style, pageNumber, startPageNumber, containerWidth }: VirtualPageProps) {
	const isSMDown = useMediaQuery(screenSize.MAX_SM);

	const { ref: inViewRef, inView } = useInView({
		root: null,
		rootMargin: isSMDown ? '150px 0px' : '300px 0px',
	});

	return (
		<div ref={inViewRef} style={style} id={page.id} className="relative">
			<span className="absolute top-2 right-2 ui-flex-center w-6 h-6 bg-gray-200 text-sm text-gray-600 rounded-full z-10">
				{startPageNumber + (page.order - 1)}
			</span>

			{inView ? (
				<Page
					devicePixelRatio={DEVICE_PIXEL_RATIO}
					pageNumber={pageNumber}
					loading={<Skeleton height={style?.height} />}
					width={containerWidth}
					renderTextLayer={false}
					renderAnnotationLayer={false}
					className="ui-flex-center w-full border border-gray-200"
				/>
			) : (
				<Skeleton height={style?.height} />
			)}
		</div>
	);
}
