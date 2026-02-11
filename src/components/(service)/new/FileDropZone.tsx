'use client';

import React from 'react';
import { CirclePlus, FileUp, Lock } from 'lucide-react';
import { MotionBlock, Button, Input, AnimateSpinner } from '@/components';
import { useDropzoneFiles } from '@/hooks';

export default function FileDropZone() {
	const {
		dropzone: { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, open },
		isLoading,
	} = useDropzoneFiles();
	const fileInputId = React.useId();

	return (
		<div className="relative w-full h-full pb-6 sm:pb-0">
			<MotionBlock
				{...getRootProps()}
				className={`h-full ${
					isLoading
						? 'bg-gradient-blue-50'
						: isDragActive && isDragAccept
							? 'bg-gradient-blue-400'
							: isDragActive && isDragReject
								? 'bg-gradient-gray-100'
								: 'bg-gradient-blue-300'
				} rounded-2xl outline outline-dashed outline-offset-2 focus-visible:rounded-2xl focus-visible:outline focus-visible:outline-offset-4`}>
				<Input
					type="file"
					id={`file-dropzone-${fileInputId}`}
					data-input-id={`file-dropzone-outer`}
					className="hidden"
					{...getInputProps()}
				/>
				<label
					htmlFor={`file-dropzone-${fileInputId}`}
					className="ui-flex-center flex-col gap-2 p-4 w-full h-full text-[15px] text-white font-bold cursor-pointer lg:p-36 lg:text-base">
					<div className="ui-flex-center gap-2">
						{isLoading ? <AnimateSpinner size={16} /> : <FileUp size={24} />}
						<span>
							{isLoading
								? 'Processing your files...'
								: isDragActive && isDragAccept
									? 'Drop your files here 😊'
									: isDragActive && isDragReject
										? 'Only PDF Files accepted'
										: 'Drag and Drop Your PDFs'}
						</span>
					</div>
					<span className="inline-flex items-center gap-2 px-2 py-1.5 text-xs text-blue-400 bg-white rounded-lg">
						<Lock size={14} /> No tracking & Saving
					</span>
				</label>
			</MotionBlock>
			<Button
				type="button"
				variant="secondary"
				onClick={open}
				disabled={isLoading}
				className="absolute bottom-9 left-[50%] -translate-x-[50%] bg-gradient-blue-200 border-gray-200 text-white z-5">
				<CirclePlus strokeWidth={2.5} /> Select your files
			</Button>
		</div>
	);
}
