'use client';

import Link from 'next/link';
import React from 'react';
import { Rotate3d } from 'lucide-react';
import { Button } from '@/components';
import { route } from '@/constants';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	React.useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex flex-col justify-center items-center flex-1 gap-4">
			<h1 className="font-black text-4xl text-center rounded-full hover:bg-light">
				<Link href={route.SERVICE.ROOT}>Skevv</Link>
			</h1>
			<h2 className="font-bold text-xl">Something wrong with this page</h2>
			<div className="flex items-center gap-2">
				<Button onClick={() => reset()} variant="secondary">
					<Rotate3d size={18} /> Retry
				</Button>
				<Button type="button" asChild>
					<Link href={route.SERVICE.ROOT}>Go Home</Link>
				</Button>
			</div>
		</div>
	);
}
