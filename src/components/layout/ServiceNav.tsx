'use client';

import React from 'react';
import { SaveIcon, ScreenShareIcon } from 'lucide-react';
import { Button, FileResetConfirmContext } from '@/components';

export default function ServiceNav() {
	const [isConfirmContextOpen, setIsConfirmContextOpen] = React.useState(false);

	return (
		<nav className="flex justify-between items-center bg-white z-10">
			<FileResetConfirmContext isOpen={isConfirmContextOpen} toggle={setIsConfirmContextOpen} />
			<div className="flex items-center gap-2">
				<Button type="button" variant="outline">
					<SaveIcon />
					<span className="hidden sm:inline">Save Draft</span>
				</Button>
				<Button type="button" variant="outline">
					<ScreenShareIcon />
					<span className="hidden sm:inline">Preview</span>
				</Button>
			</div>
		</nav>
	);
}
