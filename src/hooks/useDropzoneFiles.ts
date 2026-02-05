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

	const hasFiles = files.length !== 0;

	//TODO: Additional Validation for file thumbnail
	const onDrop = async (acceptedFiles: FileWithPath[], rejections: FileRejection[], event: DropEvent) => {
		let inputIdValue: string | undefined;

		const willUpdateFiles: RawFileItem[] = acceptedFiles
			.map(file => ({
				id: `${file.name}-${Date.now()}`,
				file,
			}))
			.sort((prev, curr) => prev.file.name.localeCompare(curr.file.name, undefined, { numeric: true, sensitivity: 'base' }));

		const fileList = hasFiles ? [...files, ...willUpdateFiles] : willUpdateFiles;

		try {
			if (rejections.length) {
				toast.warning(`Uploaded ${rejections.length} files are not PDF type`);
			}

			const asyncFiles = await toast
				.promise(getProcessedFileListWithCountedPages(fileList), {
					loading: 'Loading all your files...',
					success: `Successfully upload your files ${rejections.length ? `without ${rejections.length} file` : ''}`,
					error: 'Error happened to add files',
				})
				.unwrap();

			if (isDragEvent(event)) {
				inputIdValue = (event.target as HTMLElement & { dataset: { inputId?: string } }).dataset.inputId;
			}

			if (inputIdValue === inputId.OUTER) {
				setFiles(asyncFiles);
			} else {
				setFiles(asyncFiles);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const ACCEPT_TYPE = { [PDF_HQ.KEY]: PDF_HQ.VALUE };

	const dropzone = useDropzone({
		accept: ACCEPT_TYPE,
		noClick: true,
		onDrop,
	});

	return { dropzone, hasFiles, files, setFiles, onReset: resetFiles };
}
