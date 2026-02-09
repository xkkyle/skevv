'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { ArrowDown, ArrowUp, Columns2, Square } from 'lucide-react';
import { AnimateSpinner, Button, getTotalPageCount } from '@/components';
import { useDropzoneFiles, useMediaQuery, useResizableObserver } from '@/hooks';
import { screenSize } from '@/constants';
import { getInitialWidth } from '@/utils/pdf';
import { useViewMode } from '@/providers/ViewModeContextProvider';

const PdfPreview = dynamic(() => import('../pdf/PdfPreview'), {
	ssr: false,
	loading: () => <FullContainerLoading />,
});

function FullContainerLoading() {
	return (
		<div className="ui-flex-center w-full h-120 bg-light rounded-2xl">
			<AnimateSpinner />
		</div>
	);
}

export default function FilePreviewListPanel() {
	const { files } = useDropzoneFiles();
	const { viewMode, setViewMode } = useViewMode();
	const isXSDown = useMediaQuery(screenSize.MAX_XS);

	const { containerRef, containerWidth } = useResizableObserver<HTMLDivElement>({
		initialWidth: getInitialWidth({ mediaQuery: isXSDown, maxSize: 800 }),
	});

	return (
		<div className="hidden flex-col flex-1 gap-2 min-h-0 col-span-full p-3 md:flex md:col-span-4">
			<div className="flex justify-between items-center min-h-8">
				<h3 className="text-md font-bold">Preview</h3>
				<div className="flex justify-between items-center gap-2">
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
			</div>

			<div className="flex-1 min-h-0 w-full overflow-y-auto scrollbar-thin">
				<div ref={containerRef} className="flex flex-col items-center gap-2 w-full md:flex-1">
					<Suspense fallback={<FullContainerLoading />}>
						{files?.map(({ id, file, pages }, idx) => {
							const startPageNumber = getTotalPageCount(files.slice(0, idx)) + 1;
							const pagesHash = pages.map(p => p.id).join('-');

							return (
								<PdfPreview
									key={`${id}-${startPageNumber}-${pagesHash}`}
									scrollParentRef={containerRef}
									file={file}
									pages={pages}
									startPageNumber={startPageNumber}
									containerWidth={containerWidth}
								/>
							);
						})}
					</Suspense>
				</div>
			</div>
		</div>
	);
}
