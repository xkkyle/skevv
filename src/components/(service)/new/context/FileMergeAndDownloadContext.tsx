'use client';

import React from 'react';
import { FilePlus } from 'lucide-react';
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
	FileMergeAndDownload,
	Kbd,
} from '@/components';
import { type ProcessedFileList, getTotalPageCount } from '../pdf';
import { useMediaQuery } from '@/hooks';
import { screenSize } from '@/constant';

interface FileMergeAndDownloadContextProps {
	files: ProcessedFileList;
	isOpen: boolean;
	toggle: React.Dispatch<React.SetStateAction<boolean>>;
}

function TriggerButton({ pageCount, isSMDown, ...props }: { pageCount: number; isSMDown: boolean }) {
	return (
		<Button
			type="button"
			size="icon-lg"
			className={`flex justify-center items-center gap-4 w-full px-${isSMDown ? 'auto' : '4'}`}
			{...props}>
			<div className="flex items-center gap-2 overflow-hidden text-ellipsis ">
				<FilePlus size={18} />
				Merge {pageCount} Pages
			</div>
			{!isSMDown && <Kbd className="text-xs">Ctrl + M</Kbd>}
		</Button>
	);
}

export default function FileMergeAndDownloadContext({ files, isOpen, toggle }: FileMergeAndDownloadContextProps) {
	const [step, setStep] = React.useState<'merge' | 'download'>('merge');

	const isSMDown = useMediaQuery(screenSize.MAX_SM);
	const pageCount = getTotalPageCount(files);

	const title = 'Merge and Download';
	const description =
		step === 'merge'
			? `Check your current work status here. ${isSMDown ? 'Press' : 'Click'} merge when you're done.`
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
						<DrawerHeader className="p-3 text-left">
							<DrawerTitle className="text-start text-lg">{title}</DrawerTitle>
							<DrawerDescription className="flex items-center gap-2 p-2 w-fit bg-gray-100 text-xs text-gray-500 text-start font-semibold rounded-md">
								{step === 'merge' ? <span>⚡️</span> : <span>✅</span>}
								{description}
							</DrawerDescription>
						</DrawerHeader>
						<FileMergeAndDownload files={files} step={step} setStep={setStep} onClose={onClose} />
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
							<DialogDescription className="flex items-center gap-2 py-2 px-2 bg-gray-100 text-xs text-gray-500 font-semibold rounded-md">
								{step === 'merge' ? <span>⚡️</span> : <span>✅</span>}
								{description}
							</DialogDescription>
						</DialogHeader>
						<FileMergeAndDownload files={files} step={step} setStep={setStep} onClose={onClose} />
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
