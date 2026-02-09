import { Metadata } from 'next';
import { Send } from 'lucide-react';
import { Wip } from '@/components';
import { SiteConfig } from '@/app/config';

export const metadata: Metadata = {
	title: SiteConfig.title.ARCHIVES,
	description: SiteConfig.description.default,
	openGraph: {
		title: SiteConfig.title.ARCHIVES,
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

export default function ArchivesPage() {
	return (
		<section className="flex-1 p-3 bg-light">
			<h2 className="mb-4 text-xl font-black sm:text-2xl">Archives</h2>
			<Wip
				message={'This page is going to being used as the page where check the temporarily saved works'}
				icon={<Send size={16} />}
				className="w-fit"
			/>
			<div className="ui-flex-center mt-3 w-full h-50 outline outline-dashed outline-offset-2 bg-white text-gray-700 rounded-xl">
				Currently, No Temporarily saved file
			</div>
		</section>
	);
}
