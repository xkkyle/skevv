'use client';

import React from 'react';
import { ArrowRight, CirclePause } from 'lucide-react';
import {
	type ProcessedFileList,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
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
	getTotalFileSize,
	getTotalPageCount,
} from '@/components';
import { useLoading, useMediaQuery } from '@/hooks';
import { LARGE_FILE_SIZE_BREAKPOINT, LARGE_PAGE_LENGTH, screenSize } from '@/constants';
import { useMergeFlowStore } from '@/store/useMergeFlowStore';

interface FileMergeAndDownloadContextProps {
	files: ProcessedFileList;
	isOpen: boolean;
	toggle: React.Dispatch<React.SetStateAction<boolean>>;
}

function TriggerButton({ pageCount, isSMDown, disabled = false, ...props }: { pageCount: number; isSMDown: boolean; disabled?: boolean }) {
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

	const { Loading, isLoading, startTransition } = useLoading();
	const isSMDown = useMediaQuery(screenSize.MAX_SM);

	const mergeFormId = React.useId();
	const abortRef = React.useRef<(() => void) | null>(null);
	const [showConfirm, setShowConfirm] = React.useState(false);

	React.useEffect(() => {
		if (!isOpen && isLoading) {
			console.log('here');
			abortRef.current?.();
		}
	}, [isOpen, isLoading]);

	const pageCount = getTotalPageCount(files);

	// const isOneFile = files.length < 2;
	// TODO: less than 50 -> Free Plan
	// over 50 -> Lite Plan
	// until 1000 -> Pro Plan

	const title = currentStep === 'merge' ? 'Merge Files' : 'Download merged file';
	const description =
		currentStep === 'merge'
			? `⚡️ Type file name first. ${isSMDown ? 'Press' : 'Click'} merge when you're done, then.`
			: `✅ Your PDF is ready to download`;

	const stopMerge = () => {
		// if merge is in progress, then abort;
		abortRef.current?.();
	};

	const onClose = () => toggle(false);

	const handleOpenChange = (open: boolean) => {
		if (!open && isLoading) {
			if (getTotalFileSize(files) > LARGE_FILE_SIZE_BREAKPOINT || getTotalPageCount(files) > LARGE_PAGE_LENGTH) {
				setShowConfirm(true);
				return;
			}

			stopMerge();
		}

		toggle(open);
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={open => {
				handleOpenChange(open);
			}}>
			<DialogTrigger asChild>
				<TriggerButton pageCount={pageCount} isSMDown={isSMDown} />
			</DialogTrigger>
			<DialogContent className="w-[90dvw] max-w-[500px]" onOpenAutoFocus={e => e.preventDefault()}>
				<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
					<AlertDialogContent>
						<AlertDialogTitle>Cancel the merge?</AlertDialogTitle>
						<AlertDialogDescription aria-label="Ask to cancel merge">Your progress will be lost</AlertDialogDescription>
						<AlertDialogFooter>
							<AlertDialogCancel>Continue merging</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									stopMerge();
									toggle(false);
								}}>
								<CirclePause />
								Stop
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<DialogHeader>
					<DialogTitle className="text-xl">{title}</DialogTitle>
					<DialogDescription className="text-sm text-gray-500 font-medium">{description}</DialogDescription>
				</DialogHeader>
				<FileMergeAndDownload
					files={files}
					isOpen={isOpen}
					pageCount={pageCount}
					mergeFormId={mergeFormId}
					abortRef={abortRef}
					startTransition={startTransition}
					onClose={onClose}
				/>
				{currentStep === 'merge' && isLoading && (
					<div className="flex flex-col gap-2 p-2 bg-gray-100 rounded-md">
						<div className="ui-flex-center-between gap-2">
							<Callout message="Please wait for a few seconds..." icon={<Loading />} className="w-full" />
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									stopMerge();
								}}>
								<CirclePause />
								Stop
							</Button>
						</div>
						<div className="flex items-center gap-2 ml-2 text-sm text-gray-500">
							<ArrowRight size={16} />
							<span>{`Stopping may take a moment for large files. If it doesn’t stop, press the Stop button again.`}</span>
						</div>
					</div>
				)}

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
							disabled={isLoading || currentStep !== 'merge'}
						/>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
