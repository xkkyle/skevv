'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SaveIcon } from 'lucide-react';
import { Button, FileResetConfirmContext } from '@/components';
import { useFileStore } from '@/store';
import { handleSave } from '@/db/controller';
import { route } from '@/constants';

const FullScreenPreviewContext = dynamic(() => import('../(service)/new/context/FullScreenPreviewContext'), { ssr: false });

export default function ServiceNav() {
	const files = useFileStore(({ files }) => files);
	const router = useRouter();

	const [isConfirmContextOpen, setIsConfirmContextOpen] = React.useState(false);
	const [isPreviewDialogOpen, setIsPreviewDialogOpen] = React.useState(false);

	const handleSaveSession = () => {
		handleSave({
			processedFiles: files,
			actionAfterSuccess: () =>
				toast.success('저장 완료', {
					action: {
						label: 'Redirect',
						onClick: () => {
							router.push(route.SERVICE.ARCHIVES);
						},
					},
				}),
		});
	};

	return (
		<nav className="ui-flex-center-between bg-white z-10">
			<FileResetConfirmContext isOpen={isConfirmContextOpen} toggle={setIsConfirmContextOpen} />
			<div className="flex items-center gap-2">
				<Button type="button" variant="outline" onClick={handleSaveSession}>
					<SaveIcon />
					<span className="hidden sm:inline">Save Draft</span>
				</Button>
				<FullScreenPreviewContext isOpen={isPreviewDialogOpen} toggle={setIsPreviewDialogOpen} />
			</div>
		</nav>
	);
}
