'use client';

import React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { FileWithPath } from 'react-dropzone';
import { Asterisk, RotateCcw, RotateCw, SquareMousePointer } from 'lucide-react';
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	PageItem,
	PdfDocumentErrorMessage,
	PdfPreviewSkeleton,
} from '@/components';
import { useDropzoneFiles, useMediaQuery, useResizableObserver } from '@/hooks';
import { screenSize } from '@/constants';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
	pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PagePreviewContextProps {
	page: PageItem;
	isOpen: boolean;
	toggle: React.Dispatch<React.SetStateAction<boolean>>;
}

interface PagePreviewProps {
	file: FileWithPath;
	pageNumber: number;
	containerWidth: number;
	rotatedAngle: number;
}

function TriggerButton({ isXSDown, ...props }: { isXSDown: boolean }) {
	return (
		<Button type="button" size="icon-sm" variant="ghost" className={`px-${isXSDown ? 'auto' : '4'}`} {...props}>
			<SquareMousePointer className="text-gray-500" />
		</Button>
	);
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

function DocumentErrorMessage() {
	return <p className="py-3 px-6 w-full bg-red-100 text-red-400 rounded-full">Error happened to get a file</p>;
}

function PagePreview({ file, pageNumber, containerWidth, rotatedAngle }: PagePreviewProps) {
	return (
		<div className="my-3">
			<Document file={file} error={DocumentErrorMessage}>
				<Page
					devicePixelRatio={2.5}
					loading={<PdfPreviewSkeleton pageCount={1} estimateHeight={300} />}
					pageNumber={pageNumber}
					width={containerWidth}
					renderTextLayer={false}
					renderAnnotationLayer={false}
					rotate={rotatedAngle}
					className="ui-flex-center w-full border border-gray-200"
				/>
			</Document>
		</div>
	);
}

export default function PagePreviewContext({ page, isOpen, toggle }: PagePreviewContextProps) {
	const { files } = useDropzoneFiles();
	const isXSDown = useMediaQuery(screenSize.MAX_XS);

	const { containerRef, containerWidth } = useResizableObserver<HTMLDivElement>({
		initialWidth: typeof window !== 'undefined' ? (isXSDown ? 300 : window.innerWidth * 0.5) : 300,
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

	const file = files.filter(file => page.id.includes(file.id))[0].file;
	const pageNumber = +page.id.split('-page-')[1];

	const title = `Page ${page.order} Preview`;
	const description = `${page.id.split('.pdf')[0]}.pdf`;

	return (
		<Dialog open={isOpen} onOpenChange={toggle}>
			<DialogTrigger asChild>
				<TriggerButton isXSDown={isXSDown} />
			</DialogTrigger>
			<DialogContent className="max-w-[96dvw] min-w-[92dvw] max-h-[92dvh] w-auto h-auto overflow-x-hidden overflow-y-auto scrollbar-thin xl:min-w-[60dvw]">
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
				<div ref={containerRef}>
					{isReady && file ? (
						<PagePreview file={file} pageNumber={pageNumber} containerWidth={containerWidth} rotatedAngle={rotatedAngle} />
					) : (
						<PdfDocumentErrorMessage />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
