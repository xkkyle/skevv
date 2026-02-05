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

const useFileStore = create(
	persist<FileStore>(
		set => ({
			files: [],
			setFiles: argument =>
				set(state => ({
					files: typeof argument === 'function' ? argument(state.files) : argument,
				})),
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
