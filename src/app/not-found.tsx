import Link from 'next/link';
import { route } from '@/constants';
import { Button } from '@/components';

export default async function NotFound() {
	return (
		<div className="flex-1 ui-flex-center min-h-screen">
			<div className="ui-flex-center gap-12 flex-col">
				<h1 className="p-4 text-black text-4xl font-black rounded-lg">Skevv</h1>
				<p className="font-black text-2xl font-mono">404</p>
				<Button asChild variant="secondary">
					<Link href={route.SERVICE.ROOT}>홈으로 가기</Link>
				</Button>
			</div>
		</div>
	);
}
