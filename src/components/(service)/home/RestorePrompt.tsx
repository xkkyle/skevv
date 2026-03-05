'use client';

import Link from 'next/link';
import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { Button, Callout } from '@/components';
import { route, smartFormatBytes } from '@/constants';
import { clearSession, loadSession, StoredData } from '@/db/db';
import { useTempFileRestore } from '@/hooks/useTempFileStore';
import { cn } from '@/lib/utils';

export default function RestorePrompt() {
	const { isRestoring, restore, resetFiles } = useTempFileRestore();
	const [savedData, setSavedData] = React.useState<StoredData | null>(null);

	React.useEffect(() => {
		const getTempFiles = async () => {
			const files = await loadSession();

			if (files) {
				setSavedData(files);
			}
		};

		getTempFiles();
	}, []);

	return (
		<div>
			{savedData && (
				<Callout icon={<Info size={16} />} message={'You have temporal save work. Do you want to continue editing?'} className="" />
			)}
			<div className={cn('grid gap-4', savedData ? 'sm:grid-cols-2' : 'grid-cols-1')}>
				{savedData ? (
					<div className="flex flex-col gap-4 mt-4 p-3 w-full bg-white border border-muted rounded-lg sm:min-w-100">
						<ul className="flex flex-col gap-3">
							{savedData?.files?.map((file, idx) => (
								<li key={file.id} className="flex flex-col gap-2 p-3 bg-light rounded-md sm:flex-row sm:items-center sm:w-fit">
									<div className="flex items-center gap-2">
										<span className="ui-flex-center w-6 h-6 text-center text-white bg-gradient-blue-100 rounded-full">{idx + 1}</span>
										<span className="inline-block p-2 bg-white rounded-lg">{file.name}</span>
									</div>
									<div className="flex items-center gap-4 ml-auto">
										<span className="inline-block p-2 bg-white rounded-lg">{file.pageCount} pages</span>
										<span className="inline-block p-2 bg-white rounded-lg">{smartFormatBytes(savedData.totalSizeOfAllFiles)}</span>
									</div>
								</li>
							))}
						</ul>
						<div className="flex flex-row-reverse items-center gap-2 ml-auto">
							<Button
								asChild
								disabled={isRestoring}
								onClick={async () => {
									await restore();
								}}>
								<Link href={route.SERVICE.WRITE}>{isRestoring ? 'Restoring ...' : 'Continue'}</Link>
							</Button>
							<Button
								variant={'outline'}
								onClick={async () => {
									await clearSession();

									setSavedData(null);
									resetFiles();
								}}>
								Delete
							</Button>
						</div>
					</div>
				) : (
					<div className="ui-flex-center flex-col gap-4 w-full h-80 outline outline-dashed outline-offset-2 bg-white text-gray-700 font-medium rounded-xl">
						<p>Currently, No Temporarily saved file</p>
						<Button variant="outline" asChild>
							<Link href={route.SERVICE.WRITE}>
								{`Let's get to start`} <ArrowRight />
							</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
