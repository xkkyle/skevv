'use client';

import React from 'react';
import { CopyPlus, EllipsisVertical, GripVertical, SquareMousePointer, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	type PageItem,
	deletePageFromFiles,
} from '@/components';
import { useDropzoneFiles, useMediaQuery } from '@/hooks';
import { getTransformStyleOnSortableContext } from '@/utils/dndSortable';
import { screenSize } from '@/constants';
import { cn } from '@/lib/utils';
import { usePreviewScroll } from '@/providers';

interface SortableFilePageProps {
	page: PageItem;
	isRecentlyAdded?: boolean;
	animationKey?: number;
	onDuplicateHighlight: (newPageId: string) => void;
	onOpenPreview: (pageId: string) => void;
}

function TriggerButton({ onClick, ...props }: { onClick: React.MouseEventHandler<HTMLButtonElement> }) {
	const isXSDown = useMediaQuery(screenSize.MAX_XS);

	return (
		<Button
			type="button"
			size="icon-sm"
			variant="ghost"
			onClick={onClick}
			className={`px-${isXSDown ? 'auto' : '4'}`}
			onPointerDown={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			{...props}>
			<SquareMousePointer className="text-gray-500" />
		</Button>
	);
}

export default function SortableFilePage({
	page,
	isRecentlyAdded,
	animationKey,
	onDuplicateHighlight,
	onOpenPreview,
}: SortableFilePageProps) {
	const { scrollToPage } = usePreviewScroll();

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: page.id,
		animateLayoutChanges: () => false,
	});

	const { files, setFiles } = useDropzoneFiles();
	const isSMDown = useMediaQuery(screenSize.MAX_SM);

	const handlePageClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).closest('button')) return;

		if (isSMDown) return;

		scrollToPage(page.id);
	};

	const duplicatePage = ({ pageId }: { pageId: PageItem['id'] }) => {
		const idx = pageId.indexOf('-page-');
		const fileId = idx === -1 ? pageId : pageId.slice(0, idx);
		const id = `${fileId}-page-${Date.now()}` as const;

		setFiles(prevFiles =>
			prevFiles.map(file => {
				if (file.id !== fileId) return file;

				const newPage: PageItem = { ...page, id, sourcePageNumber: page.sourcePageNumber, order: page.order + 1, rotation: 0 };

				const pageIndex = file.pages.findIndex(page => page.id === pageId);
				const newPages = [...file.pages];
				newPages.splice(pageIndex + 1, 0, newPage);

				const updatedPages = newPages.map((page, idx) => ({
					...page,
					order: idx + 1,
				}));

				return {
					...file,
					pages: updatedPages,
					pageCount: updatedPages.length,
				};
			}),
		);
		onDuplicateHighlight(id);
	};

	const deletePageWithUndo = ({ pageId }: { pageId: PageItem['id'] }) => {
		const idx = pageId.indexOf('-page-');
		const fileId = idx === -1 ? pageId : pageId.slice(0, idx);

		const targetFile = files.find(file => file.id === fileId);

		const removed = targetFile?.pages.find(page => page.id === pageId);

		if (!targetFile || !removed) return;
		const removedIndex = [...targetFile.pages].sort((prev, curr) => prev.order - curr.order).findIndex(page => page.id === pageId); // Current Display Order index -> to undo on Toast

		// 1) Remove
		setFiles(files => deletePageFromFiles(files, pageId));

		if (files.find(file => file.id === fileId)?.pages.length === 1) return;

		// 2) Undo
		toast('Removed page', {
			description: `${targetFile.file.name} - Page ${removed.order}`,
			action: {
				label: 'Undo',
				onClick: () => {
					setFiles(prevFiles =>
						prevFiles.map(file => {
							if (file.id !== fileId) return file;

							// Revert : insert original page(removed) into current pages(next) and reorder
							const next = [...file.pages];
							next.splice(Math.max(0, removedIndex), 0, removed);

							const updatedPages = next.sort((prev, curr) => prev.order - curr.order).map((page, idx) => ({ ...page, order: idx + 1 }));

							return { ...file, pages: updatedPages, pageCount: updatedPages.length };
						}),
					);
				},
			},
			duration: 4000,
		});
	};

	return (
		<div
			key={isRecentlyAdded ? animationKey : undefined}
			ref={setNodeRef}
			{...attributes}
			style={getTransformStyleOnSortableContext(transform, transition)}
			onClick={handlePageClick}
			className={cn(
				'ui-flex-center-between gap-2 p-2 w-full bg-light border border-muted rounded-lg cursor-pointer sm:focus:border-gray-300 transition-colors',
				isDragging ? 'opacity-85 border-2 border-dashed bg-gray-50' : 'opacity-100',
				isRecentlyAdded ? 'animate-highlight' : '',
			)}>
			<div className="ui-flex-center gap-2">
				<Button
					type="button"
					size="icon-sm"
					variant="ghost"
					className="touch-none"
					{...listeners}
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
					}}>
					<GripVertical className="text-gray-500" />
				</Button>
				<span>Page {page.order}</span>
			</div>
			<div className="flex items-center gap-1">
				<TriggerButton
					onClick={e => {
						e.preventDefault();
						e.stopPropagation();
						onOpenPreview(page.id);
					}}
				/>

				<DropdownMenu>
					<DropdownMenuTrigger asChild aria-label="Open Detail Menu">
						<Button type="button" variant="ghost" size="icon-sm">
							<EllipsisVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="mr-1">
						<DropdownMenuItem className="cursor-pointer">
							<Button type="button" variant="ghost" size="sm" onClick={() => duplicatePage({ pageId: page.id })}>
								<CopyPlus className="text-gray-700" />
								Duplicate
							</Button>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="cursor-pointer">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-red-500 hover:text-red-500"
								onClick={() => deletePageWithUndo({ pageId: page.id })}>
								<Trash className="text-red-500" />
								Delete
							</Button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
