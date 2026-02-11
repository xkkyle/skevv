/// <reference lib="webworker" />

import { degrees, PDFDocument } from 'pdf-lib';
import { pipe, chunk, toArray, zip } from '@fxts/core';

interface WorkerPageItem {
	id: string;
	sourcePageNumber: number;
	order: number;
	rotation: number;
}

type AbortRequest = {
	id: string;
	type: 'abort';
};

type MergeRequest = {
	id: string;
	type: 'merge' | 'abort';
	buffers: ArrayBuffer[];
	pagesByFile: WorkerPageItem[][];
};

type Request = MergeRequest | AbortRequest;

type MergeSuccess = { id: string; type: 'merge'; ok: true; bytes: ArrayBuffer };
type WorkerError = { id: string; type: Request['type']; ok: false; error: string };

type WorkerResponse = MergeSuccess | WorkerError;
type MergeResponse = MergeSuccess | WorkerError;

const toArrayBuffer = (uInt8Array: Uint8Array) =>
	uInt8Array.buffer.slice(uInt8Array.byteOffset, uInt8Array.byteOffset + uInt8Array.byteLength);

let currentTaskId: string | null = null;

self.onmessage = async (event: MessageEvent<Request>) => {
	const message = event.data;

	try {
		if (message.type === 'abort') {
			currentTaskId = null;
			return;
		}

		if (message.type === 'merge') {
			currentTaskId = message.id;
			const createdPdf = await PDFDocument.create();

			const batches = pipe(zip(message.buffers, message.pagesByFile), chunk(2), toArray);

			for (const batch of batches) {
				if (currentTaskId !== message.id) {
					throw new Error('Operation aborted');
				}

				const loaded = await Promise.all(
					batch.map(async ([buffer, pages]) => {
						const pdf = await PDFDocument.load(buffer);

						return { pdf, pages };
					}),
				);

				for (const { pdf, pages } of loaded) {
					if (currentTaskId !== message.id) {
						throw new Error('Operation aborted');
					}

					const sortedPages = pipe(pages, toArray, array => array.sort((prev, curr) => prev.order - curr.order));

					const virtualPages = await createdPdf.copyPages(
						pdf,
						sortedPages.map(({ sourcePageNumber }) => sourcePageNumber - 1),
					);

					virtualPages.forEach((page, idx) => {
						const rotation = sortedPages[idx].rotation;

						if (rotation) {
							page.setRotation(degrees(rotation));
						}

						createdPdf.addPage(page);
					});
				}
			}

			if (currentTaskId !== message.id) {
				throw new Error('Operation aborted');
			}

			const mergedUnit8Array = await createdPdf.save();
			const bytes = toArrayBuffer(mergedUnit8Array);

			self.postMessage({ id: message.id, type: message.type, ok: true, bytes }, [bytes]);

			currentTaskId = null;
			return;
		}
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);

		self.postMessage({ id: message.id, type: message.type, ok: false, error });
		currentTaskId = null;
	}
};

export type { WorkerPageItem, MergeRequest, Request, WorkerResponse, MergeResponse };
