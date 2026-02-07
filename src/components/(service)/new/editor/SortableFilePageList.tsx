'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ScrollArea, SortableFilePage } from '@/components';
import { useAdaptiveSensors, useDropzoneFiles } from '@/hooks';
import { type ProcessedFileItem } from '../pdf';

interface SortableFilePagesProps {
	file: ProcessedFileItem;
	isOpen: boolean;
}

const PagePreviewContext = dynamic(() => import('../context/PagePreviewContext'), { ssr: false });

export default function SortableFilePageList({ file, isOpen }: SortableFilePagesProps) {
	const { files, setFiles } = useDropzoneFiles();
	const { sensors, sensorType } = useAdaptiveSensors();

	const sortedPages = [...file.pages].sort((prev, curr) => prev.order - curr.order);

	const [previewOpen, setPreviewOpen] = React.useState(false);
	const [selectedId, setSelectedId] = React.useState<string | null>(null);

	const selectedPage = React.useMemo(() => file.pages.find(page => page.id === selectedId) ?? null, [file.pages, selectedId]);

	const openPreview = (pageId: string) => {
		setSelectedId(pageId);
		setPreviewOpen(true);
	};

	const onPreviewOpenChange = (open: boolean) => {
		setPreviewOpen(open);
		if (!open) setSelectedId(null);
	};

	const handlePageDragEnd = (event: DragEndEvent, fileId: string) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		setFiles(
			files.map(file => {
				if (file.id !== fileId) return file;

				const oldIndex = file.pages.findIndex(page => page.id === active.id);
				const newIndex = file.pages.findIndex(page => page.id === over.id);

				const newPages = arrayMove([...file.pages], oldIndex, newIndex);

				return {
					...file,
					pages: newPages.map((page, idx) => ({ ...page, order: idx + 1 })),
				};
			}),
		);
	};

	return (
		<>
			<div className="grid grid-cols-12 w-full">
				<div className="col-span-1 ml-1 h-full w-1.5 bg-muted rounded-full" />
				<DndContext
					key={sensorType}
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={(event: DragEndEvent) => handlePageDragEnd(event, file.id)}>
					<SortableContext items={sortedPages.map(page => page.id)} strategy={verticalListSortingStrategy}>
						<ScrollArea
							className={`col-span-11 w-full ${
								isOpen ? 'max-h-60 min-h-8' : 'max-h-0'
							} overflow-y-auto transition-all will-change-transform duration-150 scrollbar-thin`}>
							<div className="flex flex-col space-y-2 pb-3 sm:pb-0">
								{sortedPages.map(page => (
									<SortableFilePage key={page.id} page={page} onOpenPreview={openPreview} />
								))}
							</div>
						</ScrollArea>
					</SortableContext>
				</DndContext>
			</div>

			{selectedPage ? <PagePreviewContext files={files} page={selectedPage} isOpen={previewOpen} toggle={onPreviewOpenChange} /> : null}
		</>
	);
}
