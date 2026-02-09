'use client';

import React from 'react';
import { BetweenHorizonalEnd, ChevronRight, EllipsisVertical, FileText, Plus } from 'lucide-react';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { Button, MotionBlock, SortableFile, FileMergeAndDownloadContext, Input, AnimateSpinner, FileInsertSkeleton } from '@/components';
import { useAdaptiveSensors, useDropzoneFiles, useFileAccordions, useKeyboardTrigger, useMediaQuery } from '@/hooks';
import { screenSize } from '@/constants';
import { cn } from '@/lib/utils';

export default function FileListPanel() {
	const {
		dropzone: { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, open },
		files,
		setFiles,
		isLoading,
	} = useDropzoneFiles();

	const isXSDown = useMediaQuery(screenSize.MAX_XS);

	const fileInputId = React.useId();
	const [isConfirmContextOpen, setIsConfirmContextOpen] = React.useState(false);
	const [currentDragFilesCount, setCurrentDragFilesCount] = React.useState(0);

	const { fileAccordions, isSomeAccordionOpen, toggle, toggleAll, closeAll } = useFileAccordions({ files });

	const { sensors, sensorType } = useAdaptiveSensors();

	const loading = isLoading;
	const accepting = !isLoading && isDragActive && isDragAccept;
	const rejecting = !isLoading && isDragActive && isDragReject;

	useKeyboardTrigger({
		handler: (e: KeyboardEvent) => {
			if (e.shiftKey && e.key.toLowerCase() === 'm') {
				e.preventDefault();
				setIsConfirmContextOpen(true);
			}
		},
	});

	const rootProps = {
		...getRootProps(),
		onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
			getRootProps().onDragEnter?.(e);

			if (e.dataTransfer?.items) {
				setCurrentDragFilesCount(e.dataTransfer.items.length);
			}
		},
		onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
			getRootProps().onDragOver?.(e);

			if (e.dataTransfer?.items) {
				setCurrentDragFilesCount(e.dataTransfer.items.length);
			}
		},
		onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
			getRootProps().onDragLeave?.(e);
			setCurrentDragFilesCount(0);
		},
	};

	const handleDragEnd = (event: DragEndEvent) => {
		closeAll();

		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = files.findIndex(file => file.id === active.id);
		const newIndex = files.findIndex(file => file.id === over.id);
		setFiles(arrayMove([...files], oldIndex, newIndex));
	};

	const deleteFileWithUndo = (fileId: string) => {
		const removed = files.find(f => f.id === fileId);
		const removedIndex = files.findIndex(f => f.id === fileId);

		if (!removed) return;

		setFiles(files.filter(prevFile => prevFile.id !== fileId));

		toast('Removed file', {
			description: removed.file.name,
			action: {
				label: 'Undo',
				onClick: () => {
					setFiles(prevFiles => {
						const next = [...prevFiles];
						next.splice(removedIndex, 0, removed);

						return next;
					});
				},
			},
			duration: 4000,
		});
	};

	return (
		<div className="relative col-span-full p-3 border-muted md:col-span-2 md:border-r">
			<div className="flex flex-col gap-2 max-h-screen h-full">
				<div className="flex justify-between items-center">
					<div>
						<h3
							className="flex items-center gap-2 p-1.5 text-md font-bold rounded-md cursor-pointer transition-colors hover:bg-muted"
							onClick={toggleAll}>
							<span>Files</span>
							<ChevronRight size={18} className={`${isSomeAccordionOpen ? 'rotate-90' : 'rotate-0'}`} />
						</h3>
					</div>
					<div className="ui-flex-center gap-2">
						<Button type="button" variant="ghost" size={'icon-sm'} onClick={open}>
							<BetweenHorizonalEnd />
						</Button>
						<Button type="button" variant="ghost" size={'icon-sm'}>
							<EllipsisVertical />
						</Button>
					</div>
				</div>

				<DndContext key={sensorType} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={files.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
						<div
							className="flex flex-col flex-1 shrink-0 min-h-0 items-center gap-1 pb-2 w-full h-full overflow-y-scroll scrollbar-thin touch-pan-y md:min-h-0 sm:pb-16"
							style={{ WebkitOverflowScrolling: 'touch' }}
							{...rootProps}>
							{files?.map(file => (
								<React.Fragment key={file.id}>
									{file.pages.length ? (
										<SortableFile
											filePage={fileAccordions.find(fileAccordion => fileAccordion.id === file.id)!}
											file={file}
											toggleFilePages={toggle}
											deleteFileWithUndo={deleteFileWithUndo}
										/>
									) : null}
								</React.Fragment>
							))}

							{(isLoading || (isDragActive && isDragAccept)) && <FileInsertSkeleton filesLength={currentDragFilesCount} />}

							<MotionBlock
								className={cn(
									`relative flex-1 mx-auto my-1 w-[calc(100%-8px)] rounded-2xl outline outline-dashed outline-offset-2 outline-gray-300 transition-colors sm:block sm:h-full`,
									loading ? 'bg-gradient-indigo-gray-50' : accepting ? 'bg-gradient-gray-100' : 'bg-gradient-gray-100',
								)}>
								<Input
									type="file"
									id={`file-dropzone-${fileInputId}`}
									data-input-id={`file-dropzone-inner`}
									className="hidden"
									{...getInputProps({
										onClick: e => {
											(e.target as HTMLInputElement).value = '';
										},
									})}
								/>
								<label
									htmlFor={`file-dropzone-${fileInputId}`}
									className="ui-flex-center min-h-64 w-full h-full cursor-pointer sm:min-h-100">
									{loading ? (
										<div className="inline-flex items-center gap-2">
											<AnimateSpinner />
											<span className="text-gray-900 font-medium">Processing...</span>
										</div>
									) : accepting ? (
										<div className="inline-flex items-center gap-2">
											<AnimateSpinner />
											<span className="text-gray-900 font-medium">Drop your files here!</span>
										</div>
									) : rejecting ? (
										<p className="text-gray-900 font-medium">Only PDF Files accepted</p>
									) : (
										<p className="ui-flex-center items-center gap-2">
											<Plus className="text-gray-900" size={18} />
											<span className="text-gray-900 font-medium">Insert more files</span>
										</p>
									)}
								</label>
								<div className="absolute bottom-3 left-[50%] -translate-x-[50%] ui-flex-center gap-2 px-2 py-1 text-white text-xs font-medium rounded-full bg-black sm:px-3 sm:py-1.5">
									<FileText size={14} />
									<span>PDF only</span>
								</div>
							</MotionBlock>
						</div>
					</SortableContext>
				</DndContext>
			</div>
			<div
				className={cn(
					isXSDown ? 'fixed' : 'absolute',
					'left-0 right-0 bottom-0',
					'px-3 pt-3 w-full bg-light rounded-xl border-t border-muted sm:rounded-t-none sm:rounded-br-none',
					isXSDown ? 'pb-[calc(env(safe-area-inset-bottom)+1.5rem)]' : 'pb-3',
				)}>
				{files.length !== 0 && <FileMergeAndDownloadContext files={files} isOpen={isConfirmContextOpen} toggle={setIsConfirmContextOpen} />}
			</div>
		</div>
	);
}
