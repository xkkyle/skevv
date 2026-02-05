'use client';

import React from 'react';
import {
	Button,
	Callout,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	FileMergeAndDownload,
	FileMergeButton,
	Kbd,
} from '@/components';
import { type ProcessedFileList, getTotalPageCount } from '../pdf';
import { useLoading, useMediaQuery } from '@/hooks';
import { screenSize } from '@/constants';
import { useMergeFlowStore } from '@/store/useMergeFlowStore';
import { CircleAlert } from 'lucide-react';

interface FileMergeAndDownloadContextProps {
	files: ProcessedFileList;
	isOpen: boolean;
	toggle: React.Dispatch<React.SetStateAction<boolean>>;
}

function TriggerButton({ pageCount, isSMDown, disabled, ...props }: { pageCount: number; isSMDown: boolean; disabled: boolean }) {
	return (
		<Button
			type="button"
			size="lg"
			className={`flex justify-center items-center gap-4 w-full px-${isSMDown ? 'auto' : '4'}`}
			disabled={disabled}
			{...props}>
			<div className="flex items-center gap-2 truncate">Merge {pageCount} Pages</div>
			{!isSMDown && <Kbd className="text-xs">Shift + M</Kbd>}
		</Button>
	);
}

export default function FileMergeAndDownloadContext({ files, isOpen, toggle }: FileMergeAndDownloadContextProps) {
	const currentStep = useMergeFlowStore(({ step }) => step);
	const mergeFormId = React.useId();

	const { Loading, isLoading, startTransition } = useLoading();
	const isSMDown = useMediaQuery(screenSize.MAX_SM);

	const pageCount = getTotalPageCount(files);

	const isOneFile = files.length < 2;

	const title = currentStep === 'merge' ? 'Merge Files' : 'Download merged file';
	const description =
		currentStep === 'merge'
			? `⚡️ Type file name first. ${isSMDown ? 'Press' : 'Click'} merge when you're done, then.`
			: `✅ Your PDF is ready to download`;

	const onClose = () => {
		toggle(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={toggle}>
			<DialogTrigger asChild>
				<TriggerButton pageCount={pageCount} isSMDown={isSMDown} disabled={isOneFile} />
			</DialogTrigger>
			<DialogContent className="w-[90dvw] max-w-[500px]" onOpenAutoFocus={e => e.preventDefault()}>
				<DialogHeader>
					<DialogTitle className="text-xl">{title}</DialogTitle>
					{isOneFile ? (
						<Callout
							message={'At least 2 files to merge. Merge more files with the Pro plan'}
							icon={<CircleAlert size={18} />}
							className="text-start"
						/>
					) : (
						<DialogDescription className="text-sm text-gray-500 font-medium">{description}</DialogDescription>
					)}
				</DialogHeader>
				<FileMergeAndDownload
					files={files}
					pageCount={pageCount}
					mergeFormId={mergeFormId}
					isOpen={isOpen}
					startTransition={startTransition}
					onClose={onClose}
				/>

				{currentStep === 'merge' && (
					<DialogFooter className="pt-3 border-t border-muted">
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<FileMergeButton
							isLoading={isLoading}
							Loading={<Loading />}
							mergeFormId={mergeFormId}
							disabled={currentStep !== 'merge' || isOneFile}
						/>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
