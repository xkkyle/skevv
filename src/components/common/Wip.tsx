import { cn } from '@/lib/utils';
import React from 'react';

export default function Wip({ message, icon, className }: { message: string; icon: React.ReactNode; className?: string }) {
	return (
		<div className={cn('flex items-center gap-3 px-6 py-3 w-full text-white bg-gradient-blue-100 rounded-full', className)}>
			<span>{icon}</span>
			<p className="font-medium text-xs sm:text-sm">{message}</p>
		</div>
	);
}
