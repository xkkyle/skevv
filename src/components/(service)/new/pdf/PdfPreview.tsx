/* eslint-disable react-hooks/incompatible-library */
'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { pdfjs, Document } from 'react-pdf';
import { FileWithPath } from 'react-dropzone';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type PageItem, PdfDocumentErrorMessage, PdfPreviewSkeleton } from '@/components';
import { useDebouncedEffect } from '@/hooks';
import { DEFAULT_A4_RATIO } from '@/constants';
import { useViewMode } from '@/providers';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
	pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const VirtualPage = dynamic(() => import('../pdf/VirtualPage'), {
	ssr: false,
});

type PDFDocumentProxy = pdfjs.PDFDocumentProxy;

interface PdfPreviewProps {
	scrollParentRef: React.RefObject<HTMLDivElement | null>;
	file: FileWithPath;
	pages: PageItem[];
	startPageNumber?: number;
	containerWidth: number;
}

const PADDING = 12;

/**
 * Progressive Enhancement
 * Calculate Size
 *
 * 1. estimateSize: `index => getEstimateHeightSize(index)`
 * 2. actual Size Calculating : `handleDocumentLoadSuccess` (save `pageHeights`)
 * 3. Re-measure : useDebouncedEffect with `rowVirtualizer.measure`
 */

export default function PdfPreview({ scrollParentRef, file, pages, startPageNumber = 1, containerWidth }: PdfPreviewProps) {
	const sortedPages = React.useMemo(() => [...pages].sort((prev, curr) => prev.order - curr.order), [pages]);

	const { viewMode } = useViewMode();

	const pdfDocumentProxyRef = React.useRef<PDFDocumentProxy | null>(null);
	const viewportRatioCache = React.useRef<number[]>([]);

	const [pageHeights, setPageHeights] = React.useState<number[]>([]);
	const [isLoaded, setLoaded] = React.useState(false);

	const pageGroups = React.useMemo(() => {
		if (viewMode === 'single') {
			return sortedPages.map(page => [page]);
		}

		// Dual Mode
		const groups: PageItem[][] = [];
		for (let i = 0; i < sortedPages.length; i += 2) {
			groups.push(sortedPages.slice(i, i + 2));
		}

		return groups;
	}, [sortedPages, viewMode]);

	const getInitialEstimateHeight = React.useMemo(() => {
		if (pageHeights.length > 0) {
			const averageHeight = pageHeights.reduce((sum, height) => sum + height, 0) / pageHeights.length;
			return averageHeight;
		}

		return containerWidth * DEFAULT_A4_RATIO + PADDING;
	}, [containerWidth, pageHeights]);

	const getEstimateHeightSize = (groupIndex: number) => {
		console.log(groupIndex);
		// single row height
		if (viewMode === 'single') {
			return pageHeights[groupIndex] || getInitialEstimateHeight;
		}

		// Dual Mode : calculate group height (bigger one between 2 pages)
		const group = pageGroups[groupIndex];
		if (!group) return getInitialEstimateHeight;

		const heights = group.map((_, idx) => {
			const pageIndex = groupIndex * 2 + idx;
			return pageHeights[pageIndex] || getInitialEstimateHeight;
		});

		console.log(heights);
		return Math.max(...heights);
	};

	const rowVirtualizer = useVirtualizer({
		count: isLoaded ? pageGroups.length : 0,
		getScrollElement: () => scrollParentRef.current,
		estimateSize: index => getEstimateHeightSize(index), // calculate each estimated virtualized row height
		overscan: 3,
	});

	useDebouncedEffect({
		callback: () => {
			rowVirtualizer.measure();
		},
		effectTriggers: [pageHeights],
		delay: 50,
	});

	useDebouncedEffect({
		callback: () => {
			if (!isLoaded) return;

			recalculateHeights();
		},
		effectTriggers: [containerWidth, viewMode],
	});

	const calculateHeights = async (pdf: PDFDocumentProxy, containerWidth: number) => {
		const width = viewMode === 'dual' ? (containerWidth - PADDING) / 2 : containerWidth;
		const heights: number[] = [];

		try {
			for (let i = 0; i < pdf.numPages; i++) {
				if (viewportRatioCache.current[i]) {
					heights.push(viewportRatioCache.current[i] * width + PADDING);
				} else {
					const page = await pdf.getPage(i + 1);
					const viewport = page.getViewport({ scale: 1 });

					// landscape or portrait PDF -> width + padding
					// 	1. width > height
					// 	2. height > width
					const ratio = viewport.height / viewport.width;

					viewportRatioCache.current[i] = ratio;
					heights.push(ratio * width + PADDING);
				}
			}

			return heights;
		} catch (e) {
			console.error(e);
		}
	};

	const recalculateHeights = async () => {
		const pdf = pdfDocumentProxyRef.current;

		if (!pdf) return;

		try {
			const heights = await calculateHeights(pdf, containerWidth);

			if (heights) {
				setPageHeights(heights);
			}
		} catch (e) {
			console.error(e);
		}
	};

	const handleDocumentLoadSuccess = async (pdf: PDFDocumentProxy) => {
		pdfDocumentProxyRef.current = pdf;

		const heights = await calculateHeights(pdf, containerWidth);

		if (heights) {
			setPageHeights(heights);
			setLoaded(true);
		}
	};

	if (!file) {
		return <p className="p-3 w-full bg-muted rounded-full">Invalid File</p>;
	}

	const pageWidth = viewMode === 'dual' ? (containerWidth - PADDING) / 2 : containerWidth;

	// the purpose of using Document's onLoadSuccess on React-PDF
	// 1. get to know totalPages
	// 2. after page's loading, execute other logic
	return (
		<div style={{ width: containerWidth }}>
			{file ? (
				<Document
					file={file}
					loading={<PdfPreviewSkeleton pageCount={pages.length} estimateHeight={getEstimateHeightSize(0)} />}
					onLoadSuccess={handleDocumentLoadSuccess}
					onLoadError={error => console.error('react-pdf [onLoadError]:', error)}
					onSourceError={error => console.error('react-pdf [onSourceError]:', error)}
					error={<PdfDocumentErrorMessage />}
					className="relative">
					<div style={{ position: 'relative', width: containerWidth, height: rowVirtualizer?.getTotalSize() }}>
						{rowVirtualizer?.getVirtualItems().map(virtualRow => {
							const groupIndex = virtualRow.index;
							const group = pageGroups[groupIndex];

							return (
								<div
									key={`group-${groupIndex}`}
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										display: 'flex',
										gap: `${PADDING}px`,
										width: containerWidth,
										height: `${virtualRow.size}px`,
										transform: `translateY(${virtualRow.start}px)`,
									}}>
									{group.map(page => {
										const pageNumber = +page.id.split('-page-')[1];

										return (
											<VirtualPage
												key={page.id}
												style={{
													width: pageWidth,
													height: '100%',
												}}
												page={page}
												pageNumber={pageNumber}
												startPageNumber={startPageNumber}
												containerWidth={pageWidth}
											/>
										);
									})}
								</div>
							);
						})}
					</div>
				</Document>
			) : (
				<PdfDocumentErrorMessage />
			)}
		</div>
	);
}
