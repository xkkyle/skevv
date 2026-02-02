import { FileWithPath } from 'react-dropzone';
import { toast } from 'sonner';
import { openDB, saveTempFile, TEMP_FILE_STORE } from './db';
import { type PageItem } from '@/components';

/**
 * {
  id: "example.pdf",
  blob: Blob,              // 실제 PDF 데이터
  pageCount: 120,
  pages: [
    { id: "xxx-page-1", order: 0 },
    { id: "xxx-page-2", order: 1 },
  ],
  updatedAt: 1710000000000
}
 */

const handleSave = async ({ file, pageCount, pages }: { file: FileWithPath; pageCount: number; pages: PageItem[] }) => {
	try {
		await saveTempFile({
			id: file.name, // 또는 uuid
			blob: file, // File === Blob
			pageCount,
			pages,
		});

		toast.success('저장 완료');
	} catch (e) {
		console.error(e);
		toast.error('저장 실패');
	}
};

export async function loadTempFile(id: string) {
	const db = await openDB();

	return new Promise<unknown>((resolve, reject) => {
		const tx = db.transaction(TEMP_FILE_STORE, 'readonly');
		const store = tx.objectStore(TEMP_FILE_STORE);

		const req = store.get(id);
		req.onsuccess = () => {
			resolve(req.result);
			toast.success('이어서 작업하기');
		};
		req.onerror = () => {
			reject(req.error);
			toast.error('불러오기 실패');
		};
	});
}

// const temp = await loadTempFile('example.pdf');
// const pdfBlob = temp.blob;

export { handleSave };
