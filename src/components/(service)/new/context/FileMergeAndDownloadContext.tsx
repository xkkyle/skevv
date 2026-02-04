'use client';

import React from 'react';
import { ArrowBigUp } from 'lucide-react';
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
	FileMergeAndDownload,
	FileMergeButton,
	Kbd,
} from '@/components';
import { type ProcessedFileList, getTotalPageCount } from '../pdf';
import { useLoading, useMediaQuery } from '@/hooks';
import { screenSize } from '@/constants';

interface FileMergeAndDownloadContextProps {
	files: ProcessedFileList;
	isOpen: boolean;
	toggle: React.Dispatch<React.SetStateAction<boolean>>;
}

function TriggerButton({ pageCount, isSMDown, ...props }: { pageCount: number; isSMDown: boolean }) {
	return (
		<Button type="button" size="lg" className={`flex justify-center items-center gap-4 w-full px-${isSMDown ? 'auto' : '4'}`} {...props}>
			<div className="flex items-center gap-2 truncate ">Merge {pageCount} Pages</div>
			{!isSMDown && (
				<Kbd className="text-xs">
					<ArrowBigUp size={8} /> + M
				</Kbd>
			)}
		</Button>
	);
}

export default function FileMergeAndDownloadContext({ files, isOpen, toggle }: FileMergeAndDownloadContextProps) {
	const [step, setStep] = React.useState<'merge' | 'download'>('merge');

	const { Loading, isLoading, startTransition } = useLoading();
	const isSMDown = useMediaQuery(screenSize.MAX_SM);
	const pageCount = getTotalPageCount(files);

	const title = step === 'merge' ? 'Merge Files' : 'Download merged file';
	const description =
		step === 'merge'
			? `Check infos here. ${isSMDown ? 'Press' : 'Click'} merge when you're done.`
			: `Your ${pageCount} pages of PDF is ready to download`;

	const onClose = () => toggle(false);

	return (
		<>
			{isSMDown ? (
				<Drawer open={isOpen} onOpenChange={toggle}>
					<DrawerTrigger asChild>
						<TriggerButton pageCount={pageCount} isSMDown={isSMDown} />
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader className="gap-2 p-3 text-left">
							<DrawerTitle className="text-start text-lg">{title}</DrawerTitle>
							<DrawerDescription className="flex items-center gap-2 w-fit text-sm text-gray-500 text-start font-medium">
								{step === 'merge' ? <span>⚡️</span> : <span>✅</span>}
								{description}
							</DrawerDescription>
						</DrawerHeader>
						<FileMergeAndDownload files={files} step={step} setStep={setStep} onClose={onClose} startTransition={startTransition} />
						<DrawerFooter>
							<FileMergeButton isLoading={isLoading} Loading={<Loading />} />
							<DrawerClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			) : (
				<Dialog open={isOpen} onOpenChange={toggle}>
					<DialogTrigger asChild>
						<TriggerButton pageCount={pageCount} isSMDown={isSMDown} />
					</DialogTrigger>
					<DialogContent className="max-w-[500px]">
						<DialogHeader>
							<DialogTitle className="text-xl">{title}</DialogTitle>
							<DialogDescription className="flex items-center gap-2 text-sm text-gray-500 font-medium">
								{step === 'merge' ? <span>⚡️</span> : <span>✅</span>}
								{description}
							</DialogDescription>
						</DialogHeader>
						<FileMergeAndDownload files={files} step={step} setStep={setStep} onClose={onClose} startTransition={startTransition} />
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<FileMergeButton isLoading={isLoading} Loading={<Loading />} />
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
