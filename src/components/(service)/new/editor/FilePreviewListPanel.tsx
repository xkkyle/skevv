'use client';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { AnimateSpinner, Button, getTotalPageCount } from '@/components';
import { useDropzoneFiles, useMediaQuery, useResizableObserver } from '@/hooks';
import { screenSize } from '@/constants';

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
	const isXSDown = useMediaQuery(screenSize.MAX_XS);

	const { containerRef, containerWidth } = useResizableObserver<HTMLDivElement>({
		initialWidth: typeof window !== 'undefined' ? (isXSDown ? 300 : window.innerWidth * 0.5) : 300,
	});

	return (
		<div className="hidden flex-col flex-1 gap-2 min-h-0 col-span-full p-3 md:flex md:col-span-4">
			<div className="flex justify-between items-center min-h-8">
				<h3 className="text-md font-bold">Preview</h3>
				<div className="flex justify-between items-center gap-2">
					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						onClick={() => {
							containerRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}}>
						<ArrowUp />
					</Button>
					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						onClick={() => {
							containerRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
						}}>
						<ArrowDown />
					</Button>
				</div>
			</div>

			<div className="flex-1 min-h-0 w-full overflow-y-auto scrollbar-thin md:min-h-0">
				<div ref={containerRef} className="flex flex-col gap-2 items-center md:flex-1">
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
