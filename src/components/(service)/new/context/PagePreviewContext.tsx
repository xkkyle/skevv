'use client';

import React from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { FileWithPath } from 'react-dropzone';
import { Asterisk, RotateCcw, RotateCw, SquareMousePointer } from 'lucide-react';
import {
	AnimateSpinner,
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
import { screenSize } from '@/constant';

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

function TriggerButton({ isSMDown, ...props }: { isSMDown: boolean }) {
	return (
		<Button type="button" size="icon-sm" variant="ghost" className={`px-${isSMDown ? 'auto' : '4'}`} {...props}>
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

function PagePreview({ file, pageNumber, containerWidth, rotatedAngle }: PagePreviewProps) {
	const isReady = containerWidth > 0;

	return (
		<div className="mt-1.5 mb-6">
			{!isReady ? (
				<PdfPreviewSkeleton pageCount={1} />
			) : (
				<Document file={file}>
					<Page
						devicePixelRatio={2.5}
						loading={
							<div className="ui-flex-center w-full h-full bg-light rounded-lg">
								<AnimateSpinner size={18} />
							</div>
						}
						pageNumber={pageNumber}
						width={containerWidth}
						renderTextLayer={false}
						renderAnnotationLayer={false}
						rotate={rotatedAngle}
						className="ui-flex-center w-full border border-gray-200"
					/>
				</Document>
			)}
		</div>
	);
}

export default function PagePreviewContext({ page, isOpen, toggle }: PagePreviewContextProps) {
	const { files } = useDropzoneFiles();
	const isSMDown = useMediaQuery(screenSize.MAX_SM);

	const { containerRef, containerWidth } = useResizableObserver<HTMLDivElement>({
		initialWidth: typeof window !== 'undefined' && isSMDown ? 300 : window.innerWidth * 0.5,
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
				<TriggerButton isSMDown={isSMDown} />
			</DialogTrigger>
			<DialogContent className="max-w-[96dvw] min-w-[85dvw] max-h-[90dvh] w-auto h-auto overflow-x-hidden overflow-y-auto scrollbar-thin xl:min-w-[60dvw]">
				<DialogHeader>
					<DialogTitle className="text-left text-lg">{title}</DialogTitle>
					<div className="flex justify-between items-center">
						<DialogDescription
							className="min-w-0 flex-1 inline-flex items-center gap-1.5
               py-1.5 px-2 w-[200px] bg-gray-100 text-gray-500 text-xs font-medium
               border border-gray-200 rounded-md truncate">
							<Asterisk size={12} />
							<span className="text-start whitespace-nowrap text-ellipsis">{description}</span>
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
