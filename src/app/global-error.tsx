'use client'; // Error components must be Client Components

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
		<html>
			<body>
				<div className="ui-flex-center flex-1 w-screen h-screen">
					<h2 className="font-bold text-xl">페이지에 문제가 있습니다.</h2>
					<Button onClick={() => reset()} variant="secondary">
						<Rotate3d size={18} /> 재시도
					</Button>
					<Button type="button" asChild>
						<Link href={route.SERVICE.ROOT}>홈으로 가기</Link>
					</Button>
				</div>
			</body>
		</html>
	);
}
