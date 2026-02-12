'use client';

import React from 'react';
import { DropEvent, FileRejection, FileWithPath, useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { type RawFileItem, getProcessedFileListWithCountedPages } from '@/components';
import { useFileStore } from '@/store';
import { PDF_HQ } from '@/constants';

const inputId = {
	OUTER: 'file-dropzone-outer',
	INNER: 'file-dropzone-inner',
} as const;

function isDragEvent(e: unknown): e is React.DragEvent<HTMLElement> {
	return !!e && typeof e === 'object' && 'target' in e;
}

export default function useDropzoneFiles() {
	const { files, setFiles, resetFiles } = useFileStore();
	const [isLoading, setIsLoading] = React.useState(false);

	const hasFiles = files.length !== 0;

	//TODO: Additional Validation for file thumbnail
	const onDrop = async (acceptedFiles: FileWithPath[], rejections: FileRejection[], event: DropEvent) => {
		const willUpdateFiles: RawFileItem[] = acceptedFiles.map(file => ({
			id: `${file.name}-${crypto.randomUUID()}`,
			file,
		}));

		let inputIdValue: string | undefined;
		if (isDragEvent(event)) {
			inputIdValue = (event.target as HTMLElement & { dataset: { inputId?: string } }).dataset.inputId;
		}

		const sortByFileName = (prev: RawFileItem, curr: RawFileItem) =>
			prev.file.name.localeCompare(curr.file.name, undefined, { numeric: true, sensitivity: 'base' });

		const fileList =
			!hasFiles || inputIdValue === inputId.OUTER
				? [...(hasFiles ? files : []), ...willUpdateFiles].sort(sortByFileName)
				: [...files, ...willUpdateFiles.sort(sortByFileName)];

		setIsLoading(true);

		try {
			if (rejections.length) {
				toast.warning(`Uploaded ${rejections.length} files are not PDF type`);
			}

			const asyncFiles = await toast
				.promise(getProcessedFileListWithCountedPages(fileList), {
					loading: 'Processing all your files...',
					success: `Successfully upload your files ${rejections.length ? `without ${rejections.length} file` : ''}`,
					error: 'Error happened to add files',
				})
				.unwrap();

			setFiles(asyncFiles);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const onReset = async () => {
		try {
			setIsLoading(true);
			await new Promise(resolve => setTimeout(resolve, 300));

			resetFiles();
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const ACCEPT_TYPE = { [PDF_HQ.KEY]: PDF_HQ.VALUE };

	const dropzone = useDropzone({
		accept: ACCEPT_TYPE,
		noClick: true,
		onDrop,
	});

	return { dropzone, hasFiles, files, setFiles, isLoading, onReset };
}
