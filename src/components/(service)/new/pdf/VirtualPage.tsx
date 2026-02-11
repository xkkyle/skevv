'use client';

import { useInView } from 'react-intersection-observer';
import { Page } from 'react-pdf';
import { AnimateSpinner, Badge, Button, type PageItem } from '@/components';
import { DEVICE_PIXEL_RATIO, screenSize } from '@/constants';
import { useDropzoneFiles, useMediaQuery } from '@/hooks';
import { Hash, RotateCcw, RotateCw } from 'lucide-react';

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

	const { setFiles } = useDropzoneFiles();
	const { id: pageId } = page;

	const getRotationAngle = ({ page, factor }: { page: PageItem; factor: 'right' | 'left' }) => {
		const currentRotation = page.rotation || 0;
		const delta = factor === 'right' ? 90 : -90;
		return (currentRotation + delta + 360) % 360;
	};

	const rotatePageOfFile = (factor: 'right' | 'left') => {
		setFiles(files =>
			files.map(file => {
				return {
					...file,
					pages: file.pages.map(page => (page.id === pageId ? { ...page, rotation: getRotationAngle({ page, factor }) } : page)),
				};
			}),
		);
	};

	return (
		<div ref={inViewRef} style={style} id={page.id} className="relative group">
			<div
				className="absolute top-2 left-2 flex items-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 -translate-y-1"
				id="rotation-button-list">
				<Button type="button" size="icon-xs" variant="outline" onClick={() => rotatePageOfFile('left')}>
					<RotateCcw />
				</Button>
				<Button type="button" size="icon-xs" variant="outline" onClick={() => rotatePageOfFile('right')}>
					<RotateCw />
				</Button>
			</div>
			<Badge variant="secondary" className="absolute top-2 right-2 ui-flex-center text-sm text-gray-600 z-10">
				<Hash className="text-blue-500" />
				{startPageNumber + (page.order - 1)}
			</Badge>
			{inView ? (
				<Page
					devicePixelRatio={DEVICE_PIXEL_RATIO}
					pageNumber={pageNumber}
					loading={<Skeleton height={style?.height} />}
					width={containerWidth}
					rotate={page.rotation}
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
