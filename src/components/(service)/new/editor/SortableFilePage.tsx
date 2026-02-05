'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { EllipsisVertical, GripVertical, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useSortable } from '@dnd-kit/sortable';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	type PageItem,
	deletePageFromFiles,
} from '@/components';
import { useDropzoneFiles } from '@/hooks';
import { getTransformStyleOnSortableContext } from '@/utils/dndSortable';

interface SortableFilePageProps {
	page: PageItem;
}

const PagePreviewContext = dynamic(() => import('../context/PagePreviewContext'), { ssr: false });

export default function SortableFilePage({ page }: SortableFilePageProps) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: page.id,
		animateLayoutChanges: () => false,
	});
	const { files, setFiles } = useDropzoneFiles();

	const [isPagePreviewContextOpen, setIsPagePreviewContextOpen] = React.useState(false);

	const deletePageWithUndo = ({ pageId }: { pageId: PageItem['id'] }) => {
		const fileId = pageId.split('-page-')[0];
		const file = files.find(file => file.id === fileId);

		const removed = file?.pages.find(page => page.id === pageId);
		if (!file || !removed) return;

		const removedIndex = [...file.pages].sort((prev, curr) => prev.order - curr.order).findIndex(page => page.id === pageId); // Current Display Order index -> to undo on Toast

		// 1) Remove
		setFiles(files => deletePageFromFiles(files, pageId));

		// 2) Undo
		toast('Removed page', {
			description: `Page ${removed.order}`,
			action: {
				label: 'Undo',
				onClick: () => {
					setFiles(prev =>
						prev.map(file => {
							if (file.id !== fileId) return file;

							// Revert : insert original page(removed) into current pages(next) and reorder
							const next = [...file.pages];
							next.splice(Math.max(0, removedIndex), 0, removed);

							const normalized = next.sort((prev, curr) => prev.order - curr.order).map((p, idx) => ({ ...p, order: idx + 1 }));

							return { ...file, pages: normalized, pageCount: normalized.length };
						}),
					);
				},
			},
			duration: 4000,
		});
	};

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			style={getTransformStyleOnSortableContext(transform, transition)}
			className="flex justify-between items-center gap-2 p-2 w-full bg-light border border-muted rounded-lg cursor-pointer">
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
				<PagePreviewContext page={page} isOpen={isPagePreviewContextOpen} toggle={setIsPagePreviewContextOpen} />
				<DropdownMenu>
					<DropdownMenuTrigger asChild aria-label="Open Detail Menu">
						<Button type="button" variant="ghost" size="icon-sm">
							<EllipsisVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
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
