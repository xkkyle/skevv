'use client';

import { Combine } from 'lucide-react';
import { Button } from '@/components';
import { AnimateLoader } from '@/hooks/useLoading';

interface MergeButtonProps {
	isLoading: boolean;
	Loading: AnimateLoader;
}

export default function FileMergeButton({ isLoading, Loading }: MergeButtonProps) {
	return (
		<Button type="submit" size="lg">
			{isLoading ? Loading : <Combine size={18} />}
			Merge
		</Button>
	);
}
