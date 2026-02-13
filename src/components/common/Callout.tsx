import React from 'react';
import { cn } from '@/lib/utils';

export default function Callout({ message, icon, className }: { message: string; icon: React.ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				'flex items-center gap-2 px-2 py-1.5 w-fit bg-gradient-blue-100 font-semibold text-white text-sm rounded-lg ',
				className,
			)}>
			{icon} {message}
		</div>
	);
}
