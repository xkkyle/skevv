/// <reference lib="webworker" />

import { PDFDocument } from 'pdf-lib';
import { pipe, chunk, map, toArray, zip } from '@fxts/core';

interface WorkerPageItem {
	id: string;
	order: number;
}

type MergeRequest = {
	id: string;
	type: 'merge';
	buffers: ArrayBuffer[];
	pagesByFile: WorkerPageItem[][];
};

type Request = MergeRequest;

type MergeSuccess = { id: string; type: 'merge'; ok: true; bytes: ArrayBuffer };
type WorkerError = { id: string; type: Request['type']; ok: false; error: string };

type WorkerResponse = MergeSuccess | WorkerError;
type MergeResponse = MergeSuccess | WorkerError;

const toArrayBuffer = (uInt8Array: Uint8Array) =>
	uInt8Array.buffer.slice(uInt8Array.byteOffset, uInt8Array.byteOffset + uInt8Array.byteLength);

self.onmessage = async (event: MessageEvent<Request>) => {
	const message = event.data;

	try {
		if (message.type === 'merge') {
			const createdPdf = await PDFDocument.create();

			const batches = pipe(zip(message.buffers, message.pagesByFile), chunk(2), toArray);

			for (const batch of batches) {
				const loaded = await Promise.all(
					batch.map(async ([buffer, pages]) => {
						const pdf = await PDFDocument.load(buffer);
						return { pdf, pages };
					}),
				);

				for (const { pdf, pages } of loaded) {
					const pageIndices = pipe(
						pages,
						toArray,
						array => array.sort((prev, curr) => prev.order - curr.order),
						map(p => +p.id.split('-page-')[1] - 1),
						toArray,
					);

					const virtualPages = await createdPdf.copyPages(pdf, pageIndices);
					virtualPages.forEach(page => createdPdf.addPage(page));
				}
			}

			const mergedUnit8Array = await createdPdf.save();
			const bytes = toArrayBuffer(mergedUnit8Array);

			self.postMessage({ id: message.id, type: message.type, ok: true, bytes }, [bytes]);
			return;
		}
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		self.postMessage({ id: message.id, type: message.type, ok: false, error });
	}
};

export type { WorkerPageItem, MergeRequest, Request, WorkerResponse, MergeResponse };
