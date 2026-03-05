import React from 'react';
import { getProcessedFileListWithCountedPages } from '@/components';
import { useFileStore } from '@/store';
import { handleLoad } from '@/db/controller';

export function useTempFileRestore() {
	const { setFiles, resetFiles } = useFileStore();
	const [isRestoring, setIsRestoring] = React.useState(false);

	const restore = async () => {
		setIsRestoring(true);

		try {
			const files = await handleLoad();
			if (!files) return;

			const rawFiles = files.map(tempFile => ({
				id: tempFile.id,
				file: new File([tempFile.blob], tempFile.name, { type: 'application/pdf' }),
				savedPages: tempFile.pages,
			}));

			const processed = await getProcessedFileListWithCountedPages(rawFiles);

			const restored = processed.map((processedFile, idx) => ({
				...processedFile,
				pages: rawFiles[idx].savedPages,
			}));

			setFiles(restored);
		} catch (e) {
			console.error(e);
		} finally {
			setIsRestoring(false);
		}
	};

	return { restore, isRestoring, resetFiles };
}
