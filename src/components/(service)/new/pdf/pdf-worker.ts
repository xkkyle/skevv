import { PDFDocument } from 'pdf-lib';
import { FileWithPath } from 'react-dropzone';
import { pipe, chunk, toArray } from '@fxts/core';
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

// TODO: multi-language options
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

const getCountedPages = async (files: RawFileList): Promise<ProcessedFileList> => {
	const pageCounts: number[] = [];
	const batchFiles = pipe(files, chunk(3), toArray);

	try {
		for (const batchFile of batchFiles) {
			const counts = await Promise.all(
				batchFile.map(async file => {
					const arrayBuffer = await file.file.arrayBuffer();
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

const saveFileOnLocal = async ({ mergedFileName, newBlob }: { mergedFileName: string; newBlob: Blob }) => {
	if ('showSaveFilePicker' in window) {
		try {
			const fileHandle = await window.showSaveFilePicker?.({
				suggestedName: `${mergedFileName}.pdf`,
				types: [
					{
						description: 'PDF files',
						accept: { [PDF_HQ.KEY]: PDF_HQ.VALUE },
					},
				],
			});

			const writable = await fileHandle?.createWritable();
			await writable?.write(newBlob);
			await writable?.close();

			return { success: true, message: ASYNC_PDF_MESSAGE.MERGE.SUCCESS.MERGE_FILE };
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw new Error(ASYNC_PDF_MESSAGE.MERGE.ERROR.CANCEL_FILE_SAVE, { cause: error });
			}
			throw new Error(ASYNC_PDF_MESSAGE.MERGE.ERROR.DURING_SAVE, { cause: error });
		}
	} else {
		// fallback download
		const url = URL.createObjectURL(newBlob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${mergedFileName}.pdf`;
		a.click();
		URL.revokeObjectURL(url);

		return { success: true, message: ASYNC_PDF_MESSAGE.MERGE.SUCCESS.MERGE_FILE };
	}
};

// ⚡️ Double try - catch
// 1. inner : local specific error
// 2. outer : get inner catch throw [ new Error(message) ] -> unify error message on outer catch
const createMergedFileBlob = async ({ files }: { files: ProcessedFileList }) => {
	try {
		const createdPdf = await PDFDocument.create();

		const batchFiles = pipe(files, chunk(3), toArray);

		for (const batchFile of batchFiles) {
			const loadedPdfs = await Promise.all(
				batchFile.map(async file => {
					const arrayBuffer = await file.file.arrayBuffer();
					const batchedPdf = await PDFDocument.load(arrayBuffer);

					return { file, pdf: batchedPdf };
				}),
			);

			for (const { file, pdf } of loadedPdfs) {
				// order : just show order of each page
				// id : fileName-page-realPageNumber
				// copyPages function need pageIndices which show the actual number of page
				const pageIndices = [...file.pages]
					.sort((prev, curr) => prev.order - curr.order)
					.map(page => {
						const originalIndex = +page.id.split('-page-')[1] - 1;
						return originalIndex;
					}); // PDF-lib use 0-based index

				const virtualPages = await createdPdf.copyPages(pdf, pageIndices);
				virtualPages.forEach(page => createdPdf.addPage(page));
			}
		}

		const mergedBytes = await createdPdf.save();
		// as BlotPart doesn't make problem, because UIntArray can be used as BlobPart
		const newBlob = new Blob([mergedBytes as BlobPart], { type: PDF_HQ.KEY });

		return newBlob;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		} else {
			throw new Error(ASYNC_PDF_MESSAGE.MERGE.ERROR.DURING_SAVE);
		}
	}
};

const prepareMergedFile = async ({
	files,
	mergedFileName,
}: {
	files: ProcessedFileList;
	mergedFileName: string;
}): Promise<MergeFileResult> => {
	try {
		const blobFile = await createMergedFileBlob({ files });
		const downloadUrl = URL.createObjectURL(blobFile);

		return {
			success: true,
			message: ASYNC_PDF_MESSAGE.MERGE.SUCCESS.MERGE_FILE,
			downloadUrl,
			fileSize: blobFile.size,
			fileName: `${mergedFileName}.pdf`,
		};
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		} else {
			throw new Error(ASYNC_PDF_MESSAGE.MERGE.ERROR.DURING_SAVE);
		}
	}
};

// 다운로드 버튼 클릭 시 호출
const downloadMergedFile = ({ downloadUrl, fileName }: { downloadUrl?: string; fileName: string }) => {
	// URL Validation
	if (!downloadUrl?.startsWith('blob:')) {
		throw new Error('Invalid download URL: Only blob URLs are allowed');
	}

	// FileName sanitize
	const sanitizedFileName = fileName.replace(/[\/\\]/g, '_');

	const a = document.createElement('a');
	a.href = downloadUrl;
	a.download = sanitizedFileName;

	// 보안 속성 추가
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
	getCountedPages,
	saveFileOnLocal,
	createMergedFileBlob,
	prepareMergedFile,
	downloadMergedFile,
	cleanupDownloadUrl,
};
