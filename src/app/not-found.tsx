import Link from 'next/link';
import { route } from '@/constants';
import { Button } from '@/components';

export default async function NotFound() {
	return (
		<div className="flex-1 ui-flex-center min-h-screen">
			<div className="ui-flex-center gap-12 flex-col">
				<h1 className="p-4 text-black text-4xl font-black rounded-lg">Skevv</h1>
				<p className="font-mono text-2xl tracking-tight">404 · Page not found</p>
				<Button asChild variant="secondary">
					<Link href={route.SERVICE.ROOT}>Go to Home</Link>
				</Button>
			</div>
		</div>
	);
}
