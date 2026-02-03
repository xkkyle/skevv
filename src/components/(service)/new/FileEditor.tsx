import React from 'react';
import { ServiceNav, FileListPanel, FilePreviewListPanel } from '@/components';
import { useMediaQuery } from '@/hooks';
import { screenSize } from '@/constants';

export default function FileEditor() {
	const is_MD_Up = useMediaQuery(screenSize.MIN_MD);

	return (
		<div className="flex flex-col gap-3 w-full h-[calc(100dvh-var(--global-layout-nav-height)-6*var(--global-layout-padding)-var(--service-nav-height))] min-h-0 overflow-hidden sm:h-[calc(100dvh-2*var(--global-layout-padding))]">
			<ServiceNav />

			<div className="grid grid-rows-1 flex-1 min-h-0 h-full border border-muted rounded-2xl md:grid-cols-6 md:max-w-full">
				<FileListPanel />
				{is_MD_Up && <FilePreviewListPanel />}
			</div>
		</div>
	);
}
