/* eslint-disable react-hooks/incompatible-library */
'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { pdfjs, Document } from 'react-pdf';
import { FileWithPath } from 'react-dropzone';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type PageItem, PdfDocumentErrorMessage, PdfPreviewSkeleton } from '@/components';
import { SCROLL_BAR_WIDTH, useDebouncedEffect } from '@/hooks';
import { PDF_DEFAULT_HEIGHT } from '@/constants';

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

export default function PdfPreview({ scrollParentRef, file, pages, startPageNumber = 1, containerWidth }: PdfPreviewProps) {
	const sortedPages = React.useMemo(() => [...pages].sort((prev, curr) => prev.order - curr.order), [pages]);

	const pdfDocumentProxyRef = React.useRef<PDFDocumentProxy | null>(null);
	const viewportRatioCache = React.useRef<number[]>([]);

	const [pageHeights, setPageHeights] = React.useState<number[]>([]);
	const [isLoaded, setLoaded] = React.useState(false);

	// single row height
	const getEstimateHeightSize = (index: number) => pageHeights[index] || PDF_DEFAULT_HEIGHT;

	const rowVirtualizer = useVirtualizer({
		count: isLoaded ? sortedPages.length : 0,
		getScrollElement: () => scrollParentRef.current,
		estimateSize: index => getEstimateHeightSize(index),
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
		effectTriggers: [containerWidth],
	});
	console.log(file);
	const calculateHeights = async (pdf: PDFDocumentProxy, containerWidth: number) => {
		const heights: number[] = [];
		const PADDING = 12;

		try {
			for (let i = 0; i < pdf.numPages; i++) {
				if (viewportRatioCache.current[i]) {
					heights.push(viewportRatioCache.current[i] * containerWidth + PADDING);
				} else {
					const page = await pdf.getPage(i + 1);
					const viewport = page.getViewport({ scale: 1 });

					// 가로가 긴 or 세로가 긴 PDF -> width 기준 + padding
					// 1. width > height
					// 2. height > width
					const ratio = viewport.height / viewport.width;

					viewportRatioCache.current[i] = ratio;
					heights.push(ratio * containerWidth + PADDING);
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

	// the purpose of using Document's onLoadSuccess on React-PDF
	// 1. get to know totalPages
	// 2. after page's loading, execute other logic
	return (
		<div style={{ width: containerWidth + SCROLL_BAR_WIDTH }}>
			{file ? (
				<Document
					file={file}
					loading={<PdfPreviewSkeleton pageCount={pages.length} estimateHeight={getEstimateHeightSize(1)} />}
					onLoadSuccess={handleDocumentLoadSuccess}
					onLoadError={error => console.error('react-pdf onLoadError:', error)}
					onSourceError={error => console.error('react-pdf onSourceError:', error)}
					error={<PdfDocumentErrorMessage />}
					className="relative">
					<div className="scrollbar-thin" style={{ position: 'relative', width: containerWidth, height: rowVirtualizer?.getTotalSize() }}>
						{rowVirtualizer?.getVirtualItems().map(virtualRow => {
							const index = virtualRow.index;
							const page = sortedPages[index];
							const pageNumber = +page.id.split('-page-')[1];

							return (
								<VirtualPage
									key={page.id}
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: containerWidth,
										height: `${virtualRow.size}px`,
										transform: `translateY(${virtualRow.start}px)`,
									}}
									page={page}
									pageNumber={pageNumber}
									startPageNumber={startPageNumber}
									containerWidth={containerWidth}
								/>
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
