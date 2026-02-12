'use client';

import React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { FileWithPath } from 'react-dropzone';
import { Asterisk, RotateCcw, RotateCw } from 'lucide-react';
import {
	type ProcessedFileItem,
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	PageItem,
	PdfDocumentErrorMessage,
	PdfPreviewSkeleton,
} from '@/components';
import { useDropzoneFiles, useMediaQuery, useResizableObserverInDialog } from '@/hooks';
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
	rotationAngle: number;
}

function RotateButtonList({ pageId }: { pageId: PageItem['id'] }) {
	const { setFiles } = useDropzoneFiles();

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
		<div className="flex items-center gap-1.5">
			<Button type="button" size="icon-sm" variant="outline" onClick={() => rotatePageOfFile('left')}>
				<RotateCcw />
			</Button>
			<Button type="button" size="icon-sm" variant="outline" onClick={() => rotatePageOfFile('right')}>
				<RotateCw />
			</Button>
		</div>
	);
}

function PagePreview({ file, pageNumber, containerWidth, rotationAngle }: PagePreviewProps) {
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
						rotate={rotationAngle}
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

	const file = React.useMemo(() => files.find(file => page.id.includes(file.id))?.file, [files, page.id]);

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
							<RotateButtonList pageId={page.id} />
						</div>
					</DialogHeader>

					<div ref={containerRef} className="w-full overflow-hidden">
						{containerWidth > 0 && file ? (
							<PagePreview file={file} pageNumber={page.sourcePageNumber} containerWidth={containerWidth} rotationAngle={page.rotation} />
						) : (
							<PdfDocumentErrorMessage />
						)}
					</div>
				</DialogContent>
			) : null}
		</Dialog>
	);
}
