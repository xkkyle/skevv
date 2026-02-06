import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProcessedFileItem } from '@/components';

type SetFilesArg = ProcessedFileItem[] | ((prev: ProcessedFileItem[]) => ProcessedFileItem[]);
type SetProcessedFiles = (files: ProcessedFileItem[]) => void;

interface FileStore {
	files: ProcessedFileItem[];
	setFiles: (argument: SetFilesArg) => void;
	resetFiles: () => void;
}

const sanitizeFiles = (files: ProcessedFileItem[]) => files.filter(file => (file.pageCount ?? 0) > 0);

const useFileStore = create(
	persist<FileStore>(
		set => ({
			files: [],
			setFiles: argument =>
				set(state => {
					const newFiles = typeof argument === 'function' ? argument(state.files) : argument;
					return { files: sanitizeFiles(newFiles) };
				}),
			resetFiles: () => set({ files: [] }),
		}),
		{
			name: 'files-storage',

			onRehydrateStorage: () => state => {
				console.log('Hydrating ﹡ Reset files');
				state?.resetFiles();
			},
		},
	),
);

export type { SetProcessedFiles };
export { useFileStore };
