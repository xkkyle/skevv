'use client';

import React from 'react';
import { ChevronRight, GripVertical, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { Button, ProcessedFileItem, SortableFilePageList } from '@/components';
import { getTransformStyleOnSortableContext } from '@/utils/dndSortable';
import { cn } from '@/lib/utils';

interface SortableFileProps {
	file: ProcessedFileItem;
	filePage: { id: string; isOpen: boolean };
	toggleFilePages: (fileId: string) => void;
	deleteFileWithUndo: (fileId: string) => void;
}

export default function SortableFile({ file, filePage, toggleFilePages, deleteFileWithUndo }: SortableFileProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: file.id,
		animateLayoutChanges: () => false,
	});

	return (
		<div className={cn(`flex flex-col justify-end gap-2 w-full`, filePage?.isOpen ? 'mb-1' : 'mb-0')}>
			<div
				ref={setNodeRef}
				{...attributes}
				style={getTransformStyleOnSortableContext(transform, transition)}
				className={`flex justify-between items-center gap-2 p-2 bg-white rounded-md border border-muted ${
					isDragging ? 'opacity-85 border-2 border-dashed' : 'opacity-100'
				} sm:cursor-pointer`}>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 shrink-0">
						<Button asChild size="icon-sm" variant="ghost">
							<div className="p-1 rounded-md hover:bg-muted touch-none" style={{ touchAction: 'none' }} {...listeners}>
								<GripVertical />
							</div>
						</Button>
						<Button type="button" size="icon-sm" variant="ghost" className="touch-none" onClick={() => toggleFilePages(file.id)}>
							<ChevronRight className={`${filePage?.isOpen ? 'rotate-90' : 'rotate-0'}`} />
						</Button>
					</div>
					<span className="grow inline-block font-medium break-all whitespace-normal text-ellipsis">{file.file.name}</span>
				</div>
				<Button type="button" size="icon-sm" variant="ghost" onClick={() => deleteFileWithUndo(file.id)}>
					<X />
					<span className="sr-only">Delete file</span>
				</Button>
			</div>
			<SortableFilePageList file={file} isOpen={filePage?.isOpen} />
		</div>
	);
}
