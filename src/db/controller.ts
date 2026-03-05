import { toast } from 'sonner';
import { getTotalFileSize, type ProcessedFileItem } from '@/components';
import { loadSession, saveSession } from './db';

/**
 * 
	id: 'current'
	files : {
  id: uuid,
	name: "example.pdf",
  blob: Blob,              // 실제 PDF 데이터
  pageCount: 120,
  pages: [
    { id: "xxx-page-1", order: 0 , sourcePageNumber: 1, rotation: 0},
    { id: "xxx-page-2", order: 1, sourcePageNumber: 1, rotation: 0 },
	]}[],
  updatedAt: 1710000000000 
}
 */

const handleSave = async ({
	processedFiles,
	actionAfterSuccess,
}: {
	processedFiles: ProcessedFileItem[];
	actionAfterSuccess?: () => void;
}) => {
	try {
		const tempFileData = processedFiles.map(({ id, file, pageCount, pages }) => ({
			id,
			name: file.name,
			blob: file,
			pageCount: pageCount,
			pages: pages,
		}));

		await saveSession({ files: tempFileData, totalSizeOfAllFiles: getTotalFileSize(processedFiles) });
		actionAfterSuccess?.();
	} catch (e) {
		console.error(e);
		toast.error('저장 실패');
	}
};

// TODO: actions 외부에서 주입하기

const handleLoad = async () => {
	try {
		const session = await loadSession();
		if (!session) return null;

		toast.success('이어서 작업하기');
		return session.files;
	} catch (e) {
		console.error(e);
		toast.error('불러오기 실패');
		return null;
	}
};

export { handleSave, handleLoad };
