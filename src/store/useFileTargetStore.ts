import { create } from 'zustand';

interface FileTargetStore {
	targetId: number;
	setTargetId: (id: number) => void;
}

const useFileTargetStore = create<FileTargetStore>(set => ({
	targetId: 0,
	setTargetId: (id: number) => set({ targetId: id }),
}));

export default useFileTargetStore;
