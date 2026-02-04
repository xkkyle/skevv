'use client';

import { Combine } from 'lucide-react';
import { Button } from '@/components';
import { AnimateLoader } from '@/hooks/useLoading';

interface MergeButtonProps {
	isLoading: boolean;
	Loading: AnimateLoader;
	mergeFormId: string;
	disabled: boolean;
}

export default function FileMergeButton({ isLoading, Loading, mergeFormId, disabled }: MergeButtonProps) {
	return (
		<Button type="submit" form={mergeFormId} disabled={disabled}>
			{isLoading ? Loading : <Combine size={18} />}
			Merge
		</Button>
	);
}
