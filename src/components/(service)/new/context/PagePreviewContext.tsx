'use client';

import React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { FileWithPath } from 'react-dropzone';
import { Asterisk, RotateCcw, RotateCw } from 'lucide-react';
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	PageItem,
	PdfDocumentErrorMessage,
	PdfPreviewSkeleton,
	ProcessedFileItem,
} from '@/components';
import { useMediaQuery, useResizableObserverInDialog } from '@/hooks';
import { DEVICE_PIXEL_RATIO, screenSize } from '@/constants';
import { getInitialWidth } from '@/utils/pdf';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
	pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PagePreviewContextProps {
	files: ProcessedFileItem[];
	page: PageItem;
	isOpen: boolean;
	toggle: (open: boolean) => void;
}

interface PagePreviewProps {
	file: FileWithPath;
	pageNumber: number;
	containerWidth: number;
	rotatedAngle: number;
}

function RotateButtonList({ modifyAngle }: { modifyAngle: (factor: 'right' | 'left') => void }) {
	return (
		<div className="flex items-center gap-1.5">
			<Button type="button" size="icon-sm" variant="outline" onClick={() => modifyAngle('left')}>
				<RotateCcw />
			</Button>
			<Button type="button" size="icon-sm" variant="outline" onClick={() => modifyAngle('right')}>
				<RotateCw />
			</Button>
		</div>
	);
}

function PagePreview({ file, pageNumber, containerWidth, rotatedAngle }: PagePreviewProps) {
	const [isLoading, setIsLoading] = React.useState(true);
	const [pageRatio, setPageRatio] = React.useState(1);

	return (
		<div className="my-3 w-full overflow-hidden">
			{isLoading && <PdfPreviewSkeleton pageCount={1} estimateHeight={containerWidth * pageRatio} description="Loading..." />}
			<div style={{ display: isLoading ? 'none' : 'block' }}>
				<Document
					file={file}
					loading={null}
					onLoadSuccess={() => setIsLoading(false)}
					onLoadError={error => {
						console.error('react-pdf [onLoadError]:', error);
						setIsLoading(false);
					}}
					onSourceError={error => console.error('react-pdf [onSourceError]:', error)}
					error={<PdfDocumentErrorMessage />}>
					<Page
						devicePixelRatio={DEVICE_PIXEL_RATIO}
						loading={null}
						pageNumber={pageNumber}
						width={containerWidth}
						renderTextLayer={false}
						renderAnnotationLayer={false}
						rotate={rotatedAngle}
						onLoadedData={page => {
							const viewport = page.getViewport({ scale: 1 });
							const actualRatio = viewport.height / viewport.width;

							setPageRatio(actualRatio);
							setIsLoading(false);
						}}
						className="ui-flex-center w-full border border-gray-200 max-w-full"
					/>
				</Document>
			</div>
		</div>
	);
}

export default function PagePreviewContext({ files, page, isOpen, toggle }: PagePreviewContextProps) {
	const isXSDown = useMediaQuery(screenSize.MAX_XS);

	const { containerRef, containerWidth } = useResizableObserverInDialog<HTMLDivElement>({
		initialWidth: getInitialWidth({ mediaQuery: isXSDown, maxSize: 900 - 32 }), // 900 - 32 = 900 - padding of DialogContent * 2
		enabled: isOpen,
	});

	const isReady = containerWidth > 0;
	const [rotatedAngle, setRotatedAngle] = React.useState(0);

	// Before closing Dialog and Drawer, reinitialize rotated Angle
	React.useEffect(() => {
		if (!isOpen) {
			setRotatedAngle(0);
		}
	}, [isOpen]);

	// TODO: use ScaleFactor to zoom in and out
	const modifyAngle = (factor: 'right' | 'left') =>
		setRotatedAngle(angle => {
			if (factor === 'right') {
				return angle + 90 > 360 ? 90 : angle + 90;
			}

			if (factor === 'left') {
				return angle - 90 < 0 ? 270 : angle - 90;
			}

			return angle;
		});

	const file = React.useMemo(() => files.find(file => page.id.includes(file.id))?.file, [files, page.id]);
	const pageNumber = +page.id.split('-page-')[1];

	const title = `Page ${page.order} Preview`;
	const description = `${page.id.split('.pdf')[0]}.pdf`;

	return (
		<Dialog open={isOpen} onOpenChange={toggle}>
			{isOpen ? (
				<DialogContent className="max-h-[92dvh] overflow-y-auto scrollbar-thin sm:max-w-[min(100vw-2rem,900px)] w-full">
					<DialogHeader>
						<DialogTitle className="text-left text-lg">{title}</DialogTitle>
						<div className="flex justify-between items-center gap-2">
							<DialogDescription className="max-w-[60dvw] sm:max-w-none sm:w-fit inline-flex items-center gap-1.5 py-1.5 px-2 bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200 rounded-md">
								<Asterisk size={12} />
								<span className="truncate">{description}</span>
							</DialogDescription>
							<RotateButtonList modifyAngle={modifyAngle} />
						</div>
					</DialogHeader>

					<div ref={containerRef} className="w-full overflow-hidden">
						{isReady && file ? (
							<PagePreview file={file} pageNumber={pageNumber} containerWidth={containerWidth} rotatedAngle={rotatedAngle} />
						) : (
							<PdfDocumentErrorMessage />
						)}
					</div>
				</DialogContent>
			) : null}
		</Dialog>
	);
}
