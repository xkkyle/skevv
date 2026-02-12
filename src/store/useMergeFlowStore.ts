import { create } from 'zustand';
import { cleanupDownloadUrl } from '@/components';

type MergeStep = 'merge' | 'download';

type MergedResult = { fileName: string; downloadUrl: string; fileSize: number; filesKey: string } | null;

interface MergeFlowStore {
	step: MergeStep;
	mergedResult: MergedResult;
	setStep: (step: MergeStep) => void;
	setMergedResult: (mergedResult: MergedResult) => void;
	reset: () => void;
}

const useMergeFlowStore = create<MergeFlowStore>((set, get) => ({
	step: 'merge',
	mergedResult: null,
	setStep: (step: MergeStep) => set({ step }),

	setMergedResult: next => {
		const prev = get().mergedResult?.downloadUrl;
		if (prev && prev !== next?.downloadUrl) cleanupDownloadUrl(prev);
		set({ mergedResult: next });
	},

	reset: () => {
		const prev = get().mergedResult?.downloadUrl;
		if (prev) cleanupDownloadUrl(prev);
		set({ step: 'merge', mergedResult: null });
	},
}));

export type { MergeStep };
export { useMergeFlowStore };
