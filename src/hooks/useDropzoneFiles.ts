'use client';

import React from 'react';
import { FileRejection, FileWithPath, useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { type RawFileItem, getProcessedFileListWithCountedPages } from '@/components';
import { useFileStore } from '@/store';
import { PDF_HQ } from '@/constants';

const ACCEPT_TYPE = { [PDF_HQ.KEY]: PDF_HQ.VALUE } as const;

function sortByFileName(prev: RawFileItem, curr: RawFileItem) {
	return prev.file.name.localeCompare(curr.file.name, undefined, { numeric: true, sensitivity: 'base' });
}

export default function useDropzoneFiles() {
	const { files, setFiles, resetFiles } = useFileStore();
	const [isLoading, setIsLoading] = React.useState(false);

	const hasFiles = files.length !== 0;

	const onDrop = async (acceptedFiles: FileWithPath[], rejections: FileRejection[]) => {
		const willUpdateFiles: RawFileItem[] = acceptedFiles.map(file => ({
			id: `${file.name}-${crypto.randomUUID()}`,
			file,
		}));

		const fileList = !hasFiles ? willUpdateFiles.sort(sortByFileName) : [...files, ...willUpdateFiles.sort(sortByFileName)];

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
		setIsLoading(true);

		try {
			await new Promise(resolve => setTimeout(resolve, 300));

			resetFiles();
		} catch (e) {
			console.error(e);
		} finally {
			setIsLoading(false);
		}
	};

	const dropzone = useDropzone({
		accept: ACCEPT_TYPE,
		noClick: true,
		onDrop,
	});

	return { dropzone, hasFiles, files, setFiles, isLoading, onReset };
}
