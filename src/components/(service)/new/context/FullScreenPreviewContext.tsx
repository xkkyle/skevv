'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { pdfjs } from 'react-pdf';
import { ArrowDown, ArrowUp, Columns2, Maximize2, Minimize2, Square } from 'lucide-react';
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	getTotalPageCount,
	PdfPreviewSkeleton,
} from '@/components';
import { useMediaQuery, useResizableObserverInDialog } from '@/hooks';
import { useViewMode } from '@/providers';
import { useFileStore } from '@/store';
import { DEFAULT_A4_RATIO, screenSize } from '@/constants';
import { getInitialWidth } from '@/utils/pdf';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
	pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface FullScreenPreviewContextProps {
	isOpen: boolean;
	toggle: (open: boolean) => void;
}

const PdfPreview = dynamic(() => import('../pdf/PdfPreview'), {
	ssr: false,
});

export default function FullScreenPreviewContext({ isOpen, toggle }: FullScreenPreviewContextProps) {
	const files = useFileStore(({ files }) => files);

	const { viewMode, setViewMode } = useViewMode();
	const isXSDown = useMediaQuery(screenSize.MAX_XS);

	const { containerRef, containerWidth } = useResizableObserverInDialog<HTMLDivElement>({
		initialWidth: getInitialWidth({ mediaQuery: isXSDown, maxSize: 800 }),
		enabled: isOpen,
	});

	return (
		<Dialog open={isOpen} onOpenChange={toggle}>
			<DialogTrigger asChild>
				<Button type="button" variant="outline">
					<Maximize2 />
					<span className="hidden sm:inline">Preview</span>
				</Button>
			</DialogTrigger>
			{isOpen ? (
				<DialogContent
					className="flex flex-col min-w-[calc(100dvw-32px)] h-[calc(100dvh-32px)]"
					showCloseButton={false}
					aria-describedby="Full Screen Preview Dialog">
					<DialogHeader className="flex-row ui-flex-center-between shrink-0 mr-12">
						<DialogTitle className="text-xl shrink-0">Preview</DialogTitle>
						<div className="ui-flex-center gap-2">
							<Button
								type="button"
								size="icon-sm"
								variant={viewMode === 'single' ? 'default' : 'ghost'}
								onClick={() => setViewMode('single')}
								title="Single page view">
								<Square size={18} />
							</Button>
							<Button
								type="button"
								size="icon-sm"
								variant={viewMode === 'dual' ? 'default' : 'ghost'}
								onClick={() => setViewMode('dual')}
								title="Dual page view">
								<Columns2 size={18} />
							</Button>

							<div className="w-px h-6 bg-muted" />

							<Button
								type="button"
								size="icon-sm"
								variant="ghost"
								title="Scroll to the top of container"
								onClick={() => {
									containerRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
								}}>
								<ArrowUp size={18} />
							</Button>
							<Button
								type="button"
								size="icon-sm"
								variant="ghost"
								title="Scroll to the bottom of container"
								onClick={() => {
									containerRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
								}}>
								<ArrowDown size={18} />
							</Button>
						</div>
						<Button
							type="button"
							variant="default"
							size="icon-sm"
							onClick={() => toggle(false)}
							className="absolute top-4 right-4 shrink-0 opacity-100 hover:opacity-70">
							<Minimize2 />
						</Button>
						<DialogDescription className="sr-only" aria-describedby="all pdf previews on full screen dialog" />
					</DialogHeader>

					<div className="flex-1 min-h-0 w-full overflow-y-auto scrollbar-thin">
						<div ref={containerRef} className="flex flex-col items-center gap-2 w-full">
							{containerWidth > 0 && files ? (
								<Suspense
									fallback={
										<PdfPreviewSkeleton pageCount={viewMode === 'dual' ? 2 : 1} estimateHeight={containerWidth * DEFAULT_A4_RATIO + 12} />
									}>
									{files?.map(({ id, file, pages }, idx) => {
										const startPageNumber = getTotalPageCount(files.slice(0, idx)) + 1;

										return (
											<PdfPreview
												key={`${id}-${startPageNumber}`}
												scrollParentRef={containerRef}
												file={file}
												pages={pages}
												startPageNumber={startPageNumber}
												containerWidth={containerWidth}
											/>
										);
									})}
								</Suspense>
							) : (
								<PdfPreviewSkeleton pageCount={viewMode === 'dual' ? 2 : 1} estimateHeight={'100%'} description="Loading..." />
							)}
						</div>
					</div>
					<DialogFooter className="shrink-0 pt-3 border-t border-muted">
						<DialogClose asChild>
							<Button type="button" variant="outline" onClick={close}>
								Close
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			) : null}
		</Dialog>
	);
}
