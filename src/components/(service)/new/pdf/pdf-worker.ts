import { FileWithPath } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { toArray, chunk, pipe } from '@fxts/core';
import { Merge } from '@/hooks';
import { PDF_HQ } from '@/constants';

interface PageItem {
	id: `${string}-page-${number}`;
	order: number;
}

interface RawFileItem {
	id: string;
	file: FileWithPath;
}

interface ProcessedFileItem extends RawFileItem {
	pageCount: number;
	pages: PageItem[];
}

type RawFileList = RawFileItem[];
type ProcessedFileList = ProcessedFileItem[];

interface MergeFileResult {
	success: boolean;
	message: string;
	downloadUrl?: string;
	fileSize: number;
	fileName: string;
}

const ASYNC_PDF_MESSAGE = {
	LOAD: {
		ERROR: 'Error happen during loading files',
	},
	VIRTUALIZE: {
		ERROR: 'Error happen during virtualization',
	},
	MERGE: {
		SUCCESS: {
			MERGE_FILE: `Successfully merged. Let's download it`,
		},
		ERROR: {
			CANCEL_FILE_SAVE: 'File Saving is canceled',
			DURING_SAVE: 'Error happen during saving',
		},
	},
} as const;

const getTotalPageCount = (files: ProcessedFileList) => {
	if (files.length === 0) return 0;

	return files.reduce((sum, file) => sum + (file?.pageCount ?? 0), 0);
};

const getProcessedFileListWithCountedPages = async (files: RawFileList): Promise<ProcessedFileList> => {
	const pageCounts: number[] = [];
	const batchFiles = pipe(files, chunk(3), toArray);

	try {
		for (const batchFile of batchFiles) {
			const counts = await Promise.all(
				batchFile.map(async rawFile => {
					const arrayBuffer = await rawFile.file.arrayBuffer();
					const batchedPdf = await PDFDocument.load(arrayBuffer);

					return batchedPdf.getPageCount();
				}),
			);

			pageCounts.push(...counts);
		}

		return files.map((file, fileIndex) => ({
			...file,
			pageCount: pageCounts[fileIndex],
			pages: Array.from({ length: pageCounts[fileIndex] }, (_, idx) => ({ id: `${file.id}-page-${idx + 1}`, order: idx + 1 })),
		}));
	} catch (error) {
		console.error('Something happened wrong to get page count');
		if (error instanceof Error) {
			throw new Error(error.message, { cause: error });
		}

		throw error;
	}
};

const deletePageFromFiles = (files: ProcessedFileList, pageId: PageItem['id']): ProcessedFileList => {
	// pageId: `${fileId}-page-${fileIndex}`
	const fileId = pageId.split('-page-')[0];

	return files.map(file => {
		if (file.id !== fileId) return file;

		const nextPages = file.pages
			.filter(page => page.id !== pageId)
			.sort((prev, curr) => prev.order - curr.order)
			.map((page, idx) => ({ ...page, order: idx + 1 }));

		return {
			...file,
			pages: nextPages,
			pageCount: nextPages.length,
		};
	});
};

const createMergedFileBlob = async ({ processedFiles, merge }: { processedFiles: ProcessedFileList; merge: Merge }) => {
	try {
		const buffers: ArrayBuffer[] = [];

		const batchFiles = pipe(processedFiles, chunk(2), toArray);

		for (const batchFile of batchFiles) {
			const batchBuffers = await Promise.all(batchFile.map(processedFile => processedFile.file.arrayBuffer()));

			buffers.push(...batchBuffers);
		}

		const mergedBytesBuffer = await merge({ buffers, pagesByFile: processedFiles.map(({ pages }) => pages) });

		return new Blob([mergedBytesBuffer], { type: PDF_HQ.KEY });
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(ASYNC_PDF_MESSAGE.MERGE.ERROR.DURING_SAVE);
	}
};

const prepareMergedFile = async ({
	files,
	mergedFileName,
	merge,
}: {
	files: ProcessedFileList;
	mergedFileName: string;
	merge: Merge;
}): Promise<MergeFileResult> => {
	try {
		const blobFile = await createMergedFileBlob({ processedFiles: files, merge });
		const downloadUrl = URL.createObjectURL(blobFile);

		return {
			success: true,
			message: ASYNC_PDF_MESSAGE.MERGE.SUCCESS.MERGE_FILE,
			downloadUrl,
			fileSize: blobFile.size,
			fileName: `${mergedFileName}.pdf`,
		};
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(ASYNC_PDF_MESSAGE.MERGE.ERROR.DURING_SAVE);
	}
};

const downloadMergedFile = ({ downloadUrl, fileName }: { downloadUrl?: string; fileName: string }) => {
	// URL Validation
	if (!downloadUrl?.startsWith('blob:')) {
		throw new Error('Invalid download URL: Only blob URLs are allowed');
	}

	const sanitizedFileName = fileName.replace(/[\/\\]/g, '_');

	const a = document.createElement('a');

	a.href = downloadUrl;
	a.download = sanitizedFileName;
	a.rel = 'noopener noreferrer';

	a.click();
	a.remove();
};

// URL 정리 (컴포넌트 unmount 시 호출)
const cleanupDownloadUrl = (downloadUrl: string) => {
	URL.revokeObjectURL(downloadUrl);
};

export type { PageItem, RawFileItem, ProcessedFileItem, RawFileList, ProcessedFileList, MergeFileResult };
export {
	ASYNC_PDF_MESSAGE,
	getTotalPageCount,
	deletePageFromFiles,
	getProcessedFileListWithCountedPages,
	createMergedFileBlob,
	prepareMergedFile,
	downloadMergedFile,
	cleanupDownloadUrl,
};
