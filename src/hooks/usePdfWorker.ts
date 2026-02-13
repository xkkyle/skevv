/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MergeRequest, WorkerResponse, MergeResponse, WorkerPageItem } from '@/workers/pdf.worker';

type PendingValue = (response: WorkerResponse) => void;
type Merge = ({ buffers, pagesByFile }: { buffers: ArrayBuffer[]; pagesByFile: WorkerPageItem[][] }) => Promise<ArrayBuffer>;

function usePdfWorker() {
	const workerRef = React.useRef<Worker | null>(null);
	const pendingRef = React.useRef(new Map<string, PendingValue>());
	const taskIdRef = React.useRef<string | null>(null);

	const createWorker = React.useCallback(() => {
		const worker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' });

		worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			const response = event.data;
			pendingRef.current.get(response.id)?.(response);
			pendingRef.current.delete(response.id);
		};

		return worker;
	}, []);

	React.useEffect(() => {
		workerRef.current = createWorker();

		return () => {
			workerRef.current?.terminate();
			workerRef.current = null;
			pendingRef.current.clear();
		};
	}, []);

	const abort = React.useCallback(() => {
		const taskId = taskIdRef.current;

		if (!taskId) return;
		workerRef.current?.terminate();
		workerRef.current = createWorker();

		const resolver = pendingRef.current.get(taskId);
		resolver?.({ id: taskId, type: 'merge', ok: false, error: 'Merging is cancelled' });

		pendingRef.current.delete(taskId);
		taskIdRef.current = null;
	}, [createWorker]);

	const merge = React.useCallback(async ({ buffers, pagesByFile }: { buffers: ArrayBuffer[]; pagesByFile: WorkerPageItem[][] }) => {
		const id = uuidv4();
		taskIdRef.current = id;

		const promise = new Promise<MergeResponse>(resolve => {
			pendingRef.current.set(id, resolve as PendingValue);
		});

		const message: MergeRequest = { id, type: 'merge', buffers, pagesByFile };

		// transfer data to reduce memory peak (O(1))
		workerRef.current?.postMessage(message, buffers);

		const response = await promise;
		taskIdRef.current = null;

		if (!response.ok) {
			throw new Error(response.error);
		}

		return response.bytes;
	}, []);

	return { merge, abort };
}

export type { Merge };
export { usePdfWorker };
