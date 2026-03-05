import { type PageItem } from '@/components';

const DB_NAME = 'pdf-editor-db';
const DB_VERSION = 1;

const SESSION_STORE = 'indexedDB_session';

interface FileData {
	id: string;
	name: string;
	blob: Blob;
	pageCount: number;
	pages: PageItem[];
}

interface StoredData {
	id: string;
	files: FileData[];
	totalSizeOfAllFiles: number;
	updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;

			if (!db.objectStoreNames.contains(SESSION_STORE)) {
				db.createObjectStore(SESSION_STORE, {
					keyPath: 'id',
				});
			}
		};

		request.onsuccess = () => {
			console.log('[OPEN DB], Successfully open DB');
			resolve(request.result);
		};
		request.onerror = () => {
			console.error('[OPEN DB], error happened to open DB');
			reject(request.error);
		};
	});
}

async function saveSession({ files, totalSizeOfAllFiles }: { files: FileData[]; totalSizeOfAllFiles: number }) {
	const db = await openDB();

	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(SESSION_STORE, 'readwrite');
		const store = transaction.objectStore(SESSION_STORE);

		store.put({
			id: 'current',
			files,
			totalSizeOfAllFiles,
			updatedAt: Date.now(),
		});

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
}

async function loadSession() {
	const db = await openDB();

	return new Promise<StoredData | undefined>((resolve, reject) => {
		const tx = db.transaction(SESSION_STORE, 'readonly');
		const req = tx.objectStore(SESSION_STORE).get('current');

		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function clearSession() {
	const db = await openDB();

	return new Promise<void>((resolve, reject) => {
		const tx = db.transaction(SESSION_STORE, 'readwrite');
		tx.objectStore(SESSION_STORE).delete('current');

		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export type { FileData, StoredData };
export { SESSION_STORE, openDB, saveSession, loadSession, clearSession };
