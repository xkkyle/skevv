'use client';

import React from 'react';
import { CirclePlus, FileUp } from 'lucide-react';
import { MotionBlock, Button, Input } from '@/components';
import { useDropzoneFiles } from '@/hooks';

export default function FileDropZone() {
	const {
		dropzone: { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, open },
	} = useDropzoneFiles();
	const fileInputId = React.useId();

	return (
		<div className="relative w-full h-full pb-6 sm:pb-0">
			<MotionBlock
				{...getRootProps()}
				className={`h-full ${
					isDragActive && isDragAccept
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
					className="ui-flex-center gap-2 p-4 w-full h-full text-[15px] text-white font-bold cursor-pointer lg:p-36 lg:text-base">
					<FileUp size={24} />
					<span>
						{isDragActive && isDragAccept
							? 'Put your files, here 😊'
							: isDragActive && isDragReject
								? 'Only PDF Files accepted'
								: 'Drag and Drop Your PDFs'}
					</span>
				</label>
			</MotionBlock>
			<Button
				type="button"
				variant="secondary"
				onClick={open}
				className="absolute bottom-8 left-[50%] -translate-x-[50%] bg-gradient-blue-200 border-gray-200 text-white z-5">
				<CirclePlus strokeWidth={2.5} /> Select your files
			</Button>
		</div>
	);
}
