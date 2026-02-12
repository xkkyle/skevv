'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SaveIcon } from 'lucide-react';
import { Button, FileResetConfirmContext } from '@/components';

const FullScreenPreviewContext = dynamic(() => import('../(service)/new/context/FullScreenPreviewContext'), { ssr: false });

export default function ServiceNav() {
	const [isConfirmContextOpen, setIsConfirmContextOpen] = React.useState(false);
	const [isPreviewDialogOpen, setIsPreviewDialogOpen] = React.useState(false);

	return (
		<nav className="flex justify-between items-center bg-white z-10">
			<FileResetConfirmContext isOpen={isConfirmContextOpen} toggle={setIsConfirmContextOpen} />
			<div className="flex items-center gap-2">
				<Button type="button" variant="outline">
					<SaveIcon />
					<span className="hidden sm:inline">Save Draft</span>
				</Button>
				<FullScreenPreviewContext isOpen={isPreviewDialogOpen} toggle={setIsPreviewDialogOpen} />
			</div>
		</nav>
	);
}
