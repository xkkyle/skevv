'use client';

import React from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	type ProcessedFileList,
	type FileNameSchema,
	fileNameSchema,
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	ASYNC_PDF_MESSAGE,
	prepareMergedFile,
	downloadMergedFile,
	Badge,
	getTotalFileSize,
} from '@/components';
import { useDropzoneFiles, usePdfWorker } from '@/hooks';
import { useMergeFlowStore } from '@/store/useMergeFlowStore';
import { smartFormatBytes } from '@/constants';

interface FileNameSetterFormProps {
	files: ProcessedFileList;
	isOpen: boolean;
	pageCount: number;
	mergeFormId: string;
	abortRef: React.MutableRefObject<(() => void) | null>;
	startTransition: <T>(promise: Promise<T>) => Promise<T>;
	onClose: () => void;
}

const DEFAULT_FILE_NAME = 'new';

export default function FileMergeAndDownload({
	files,
	isOpen,
	pageCount,
	mergeFormId,
	abortRef,
	startTransition,
	onClose,
}: FileNameSetterFormProps) {
	const form = useForm<FileNameSchema>({
		resolver: zodResolver(fileNameSchema),
		defaultValues: {
			fileName: DEFAULT_FILE_NAME,
		},
	});

	const { merge, abort } = usePdfWorker();
	const { onReset } = useDropzoneFiles();

	const step = useMergeFlowStore(({ step }) => step);
	const mergedResult = useMergeFlowStore(({ mergedResult }) => mergedResult);
	const setStep = useMergeFlowStore(({ setStep }) => setStep);
	const setMergedResult = useMergeFlowStore(({ setMergedResult }) => setMergedResult);
	const resetMergeFlow = useMergeFlowStore(({ reset }) => reset);

	const inFlightRef = React.useRef(false);

	const filesKey = React.useMemo(
		() =>
			files
				.map(({ id, file, pages }) => `${id}-${file.size}-${pages.map(page => page.id)}-${pages.map(page => page.rotation).join('|')}`)
				.join('|'),
		[files],
	);

	React.useEffect(() => {
		if (!isOpen) return;

		if (step === 'download') {
			const prevKey = mergedResult?.filesKey;

			if (!prevKey || prevKey !== filesKey) {
				resetMergeFlow();
			}
		}
	}, [isOpen, step, mergedResult?.filesKey, filesKey, resetMergeFlow]);

	React.useEffect(() => {
		abortRef.current = abort;

		return () => {
			abortRef.current = null;
		};
	}, [abort, abortRef]);

	const onSubmit = async (values: FileNameSchema) => {
		if (files?.length === 0) return;
		if (step !== 'merge') return;
		if (inFlightRef.current) return;

		inFlightRef.current = true;

		try {
			const { success, message, downloadUrl, fileName, fileSize } = await startTransition(
				prepareMergedFile({ files, merge, mergedFileName: values.fileName }),
			);

			if (success && downloadUrl) {
				setMergedResult({ fileName, downloadUrl, fileSize, filesKey });
				setStep('download');

				toast.success(message);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : ASYNC_PDF_MESSAGE.MERGE.ERROR.CANCEL_FILE_SAVE;

			toast.error(message);
		} finally {
			inFlightRef.current = false;
		}
	};

	const handleDownload = () => {
		if (mergedResult) {
			downloadMergedFile(mergedResult);

			onClose();
			toast.success('Successfully downloaded');
		}
	};

	const resetAll = () => {
		onReset();

		// step=merge, mergedResult=null
		resetMergeFlow();
	};

	return (
		<div className="flex flex-col gap-3">
			{step === 'merge' && (
				<Form {...form}>
					<form id={mergeFormId} className="pt-3" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="fileName"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="font-medium text-sm">File Name</FormLabel>
									<FormControl>
										<Input type="text" placeholder="Set your merged filename" {...field} />
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						<ul className="flex items-center gap-2 my-3">
							<li>
								<Badge variant="secondary">{files.length} files</Badge>
							</li>
							<li>
								<Badge variant="secondary">{pageCount} pages</Badge>
							</li>
							<li>
								<Badge variant="secondary">{smartFormatBytes(getTotalFileSize(files))}</Badge>
							</li>
						</ul>
					</form>
				</Form>
			)}
			{step === 'download' && (
				<>
					<div className="flex flex-col gap-2 py-3">
						<span className="text-sm font-medium">Details</span>
						<ul className="flex items-center gap-2">
							<li>
								<Badge variant="secondary">{pageCount} pages</Badge>
							</li>
							<li>
								<Badge variant="secondary">{smartFormatBytes(mergedResult?.fileSize ?? 0)}</Badge>
							</li>
						</ul>
					</div>
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-muted pt-3">
						<Button type="button" variant="outline" onClick={resetAll}>
							<RotateCcw />
							Reset
						</Button>
						<Button type="button" variant="default" onClick={handleDownload}>
							<Download />
							Download
							<span className="inline-block truncate max-w-[200px] font-black">{mergedResult?.fileName}</span>
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
