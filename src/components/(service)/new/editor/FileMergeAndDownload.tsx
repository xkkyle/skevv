'use client';

import React from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	type ProcessedFileList,
	type FileNameSchema,
	type MergeFileResult,
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
	getTotalPageCount,
	downloadMergedFile,
	cleanupDownloadUrl,
} from '@/components';
import { useDropzoneFiles } from '@/hooks';

interface FileNameSetterFormProps {
	files: ProcessedFileList;
	step: 'merge' | 'download';
	setStep: React.Dispatch<React.SetStateAction<'merge' | 'download'>>;
	onClose: () => void;
	startTransition: <T>(promise: Promise<T>) => Promise<T>;
}

const DEFAULT_FILE_NAME = 'new';

export default function FileMergeAndDownload({ files, step, setStep, onClose, startTransition }: FileNameSetterFormProps) {
	const form = useForm<FileNameSchema>({
		resolver: zodResolver(fileNameSchema),
		defaultValues: {
			fileName: DEFAULT_FILE_NAME,
		},
	});

	const { onReset } = useDropzoneFiles();

	const [mergeResult, setMergeResult] = React.useState<Pick<MergeFileResult, 'downloadUrl' | 'fileName'> | null>(null);
	const totalPageCount = getTotalPageCount(files);

	React.useEffect(() => {
		return () => {
			if (mergeResult?.downloadUrl) {
				cleanupDownloadUrl(mergeResult.downloadUrl);
				setStep('merge');
			}
		};
	}, [mergeResult, setStep]);

	const onSubmit = async () => {
		if (files?.length === 0) return;

		try {
			const mergedFileName = form.getValues('fileName');

			const { success, message, downloadUrl, fileName } = await startTransition(prepareMergedFile({ files, mergedFileName }));

			if (success && downloadUrl) {
				setMergeResult({ downloadUrl, fileName });
				setStep('download');
				toast.success(message);
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : ASYNC_PDF_MESSAGE.MERGE.ERROR.CANCEL_FILE_SAVE;

			toast.error(message);
		}
	};

	const handleDownload = () => {
		if (mergeResult) {
			downloadMergedFile(mergeResult);

			onClose();
			toast.success('Successfully downloaded');
		}
	};

	const reset = () => {
		onReset();
		setMergeResult(null);
		setStep('merge');
	};

	return (
		<div className="flex flex-col gap-3 py-4">
			{step === 'merge' && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
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
						<ul className="flex justify-between items-center gap-2 my-3">
							<li className="w-full p-3 text-center bg-gray-100 font-medium rounded-lg">{files.length} files</li>
							<li className="w-full p-3 text-center bg-gray-100 font-medium rounded-lg">{totalPageCount} pages</li>
						</ul>
					</form>
				</Form>
			)}
			{step === 'download' && (
				<div className="flex flex-col gap-3 w-full mt-8">
					<Button type="button" variant="default" onClick={handleDownload}>
						<Download />
						Download
						<span className="inline-block truncate max-w-[200px] font-black">{mergeResult?.fileName}</span>
					</Button>
					<Button type="button" variant="outline" onClick={reset}>
						<RotateCcw />
						Reset
					</Button>
				</div>
			)}
		</div>
	);
}
