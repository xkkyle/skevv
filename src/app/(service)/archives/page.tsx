import { Metadata } from 'next';

import { RestorePrompt } from '@/components';
import { SiteConfig } from '@/app/config';
import { createClient } from '@/lib/supabase/server';
import { TABLE } from '@/lib/supabase';

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

export default async function ArchivesPage() {
	const supabase = await createClient();
	const { error } = await supabase.from(TABLE.ARCHIVE).select('*');

	if (error) {
		throw error;
	}

	return (
		<section className="flex-1 p-3 bg-light">
			<h2 className="mb-4 text-xl font-black sm:text-2xl">Archives</h2>
			<RestorePrompt />
		</section>
	);
}
