import { Metadata } from 'next';
import { ArrowUpRight, Send } from 'lucide-react';
import { Wip } from '@/components';
import { SiteConfig } from '@/app/config';
import { formatByISOKoreanTime } from '@/lib/date';
import { createClient } from '@/lib/supabase/server';
import { TABLE } from '@/lib/supabase';
import { mapArchiveToView } from '@/types';

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
	const { data, error } = await supabase.from(TABLE.ARCHIVE).select('*');

	if (error) {
		throw error;
	}

	const archives = data.map(mapArchiveToView);

	return (
		<section className="p-3 bg-light">
			<h2 className="mb-4 text-xl font-black sm:text-2xl">Archives</h2>
			<Wip
				message={
					"This page is going to being used as the page where check the temporarily saved ones and show the file works' list who sign up the service"
				}
				icon={<Send size={16} />}
			/>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-5">
				<div className="row-span-auto md:col-span-5">
					<ul className="flex flex-col gap-3 mt-3">
						{archives.map(item => (
							<li key={item.id} className="flex justify-between items-center gap-2 p-3 bg-white rounded-lg">
								<div className="flex flex-col gap-2">
									<div className="flex items-center gap-2">
										<span className="inline-block w-2 h-2 rounded-full bg-gradient-blue-200" />
										<p className="py-1.5 px-3 bg-muted font-bold rounded-md">{item.title}</p>
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-700">
										<span className="p-1 bg-light font-medium rounded-md">{item.size} bytes</span>
										<span className="p-1 bg-light font-medium rounded-md">{item.pageCount} pages</span>
										<span className="p-1 bg-light font-medium rounded-md text-sm text-gray-600">
											{formatByISOKoreanTime(item.created_at)}
										</span>
									</div>
								</div>
								<ArrowUpRight size={16} />
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
