'use client';

import { useInView } from 'react-intersection-observer';
import { Page } from 'react-pdf';
import { Hash, RotateCcw, RotateCw } from 'lucide-react';
import { type PageItem, AnimateSpinner, Badge, Button, Skeleton } from '@/components';
import { DEVICE_PIXEL_RATIO, screenSize } from '@/constants';
import { useDropzoneFiles, useMediaQuery } from '@/hooks';
import { getRotationAngle } from '@/utils/pdf';

interface VirtualPageProps {
	page: PageItem;
	style: React.CSSProperties;
	pageNumber: number;
	startPageNumber: number;
	containerWidth: number;
}

function CustomSkeleton({ width, height }: { width?: React.CSSProperties['width']; height?: React.CSSProperties['height'] }) {
	return (
		<Skeleton style={{ width, height }} className="ui-flex-center flex-1 w-full min-h-20">
			<AnimateSpinner size={18} />
		</Skeleton>
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
					loading={<CustomSkeleton width={style?.width} height={style?.height} />}
					width={containerWidth}
					rotate={page.rotation}
					renderTextLayer={false}
					renderAnnotationLayer={false}
					className="ui-flex-center w-full border border-gray-200"
				/>
			) : (
				<CustomSkeleton width={style?.width} height={style?.height} />
			)}
		</div>
	);
}
