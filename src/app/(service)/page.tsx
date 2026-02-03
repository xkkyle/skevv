import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button, Greeting } from '@/components';
import { route } from '@/constants';
import { SiteConfig } from '../config';

export const metadata: Metadata = {
	title: SiteConfig.title.HOME,
	description: SiteConfig.description.default,
	openGraph: {
		title: SiteConfig.title.HOME,
		description: SiteConfig.description.default,
		images: [
			{
				url: `${SiteConfig.url}/og/skevv-og.png`,
				width: 1200,
				height: 630,
			},
		],
	},
};

export default async function HomePage() {
	return (
		<div className="flex flex-col justify-items-center min-h-screen gap-3 p-3 pb-20 bg-white">
			<Greeting />
			<div className="mx-auto p-12 w-full text-white font-semibold bg-gradient-blue-100 rounded-lg md:w-fit md:min-w-120">
				<p>This is a lightweight PDF Editor</p>
				<p>Still Work In Progress ⚡️</p>
			</div>

			<div className="flex flex-col gap-3 mx-auto w-full md:w-fit md:min-w-120">
				<Button asChild variant="secondary" size="icon-lg" className="w-full">
					<Link href={route.SERVICE.WRITE}>
						Merge PDF
						<ArrowUpRight size={18} />
					</Link>
				</Button>
				<Button asChild variant="secondary" size="icon-lg" className="w-full">
					<Link href={route.SERVICE.ARCHIVES}>
						Archives
						<ArrowUpRight size={18} />
					</Link>
				</Button>
			</div>
		</div>
	);
}
