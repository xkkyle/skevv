'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSelectedLayoutSegment } from 'next/navigation';
import { FilePlus, FolderOpenDot, Search } from 'lucide-react';
import skevvSVG from '@/public/favicon/favicon.svg';
import { UserProfile, Button } from '@/components';
import { route } from '@/constant';

const links = [
	{ title: 'Merge PDF', to: route.SERVICE.WRITE, icon: <FilePlus size={18} className="text-gray-900" /> },
	{ title: 'Archives', to: route.SERVICE.ARCHIVES, icon: <FolderOpenDot size={18} className="text-gray-900" /> },
] as const;

export default function Aside() {
	const segment = useSelectedLayoutSegment();

	return (
		<div className="relative">
			<aside
				className={`fixed flex-col top-0 left-0 hidden py-2 h-full w-14 max-h-screen bg-white overflow-y-auto overflow-x-hidden border-muted border-r z-10 sm:sticky sm:flex lg:w-56 lg:p-3`}>
				<div className="flex flex-col justify-between gap-4 h-full lg:gap-4">
					<header className="flex justify-center items-center min-h-9 lg:justify-between">
						<h1 className="flex justify-center item-center">
							<Link href={route.SERVICE.ROOT} className="inline-flex justify-center items-center gap-1.5 h-7 font-black text-lg">
								<Image src={skevvSVG} alt={'Skevv'} width={24} height={24} className="inline-block w-full h-full" priority />
								<span className="hidden tracking-tight font-mono lg:inline">SKEVV</span>
							</Link>
						</h1>
						<Button type="button" variant="ghost" size="icon-sm" className="hidden lg:inline-flex">
							<Search size={18} className="text-gray-900" />
						</Button>
					</header>
					<nav className="flex flex-col flex-1 gap-2 sm:px-2 lg:px-0">
						{links.map(({ title, to, icon }) => (
							<Link
								href={to}
								key={to}
								className={`ui-flex-center gap-0 py-1.5 px-2 min-h-[36px] ${
									to === route.SERVICE.ROOT + segment ? 'bg-muted' : 'bg-white'
								} text-gray-800 font-medium rounded-md hover:bg-muted active:bg-gray-200 transition-colors lg:gap-2 lg:justify-between`}>
								<div className="ui-flex-center gap-2">
									{icon}
									<span className="hidden lg:inline">{title}</span>
								</div>
								{to === route.SERVICE.ROOT + segment && (
									<div className="hidden mr-2 w-1.5 h-1.5 rounded-full bg-gradient-blue-200 lg:inline-block" />
								)}
							</Link>
						))}
					</nav>
				</div>
				<div className="flex flex-col gap-1 mx-2 lg:mx-0">
					<UserProfile />
				</div>
				<small className="text-default mx-3 mb-2 mt-1 hidden text-[0.5rem] opacity-50 lg:block">
					© 2026{' '}
					<Link href={route.SERVICE.ROOT} className="hover:underline" target="_blank">
						SKEVV
					</Link>
				</small>
			</aside>
		</div>
	);
}
