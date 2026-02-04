'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import Image from 'next/image';
import { FilePlus, FolderOpenDot } from 'lucide-react';
import skevvSVG from '@/public/favicon/favicon.svg';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarRail,
	SidebarTrigger,
	UserProfile,
} from '@/components';
import { route } from '@/constants';
import { cn } from '@/lib/utils';

const links = [
	{ title: 'Merge', to: route.SERVICE.WRITE, icon: <FilePlus size={18} className="text-gray-900" /> },
	{ title: 'Archives', to: route.SERVICE.ARCHIVES, icon: <FolderOpenDot size={18} className="text-gray-900" /> },
] as const;

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const segment = useSelectedLayoutSegment();
	const currentPath = segment ? `${route.SERVICE.ROOT}${segment}` : route.SERVICE.ROOT;

	return (
		<Sidebar {...props} className="bg-white" collapsible="icon">
			<SidebarHeader className="flex flex-row items-center justify-between gap-2 py-3">
				<h1 className="flex justify-center items-center px-2 group-data-[state=collapsed]:hidden">
					<Link
						href={route.SERVICE.ROOT}
						className="inline-flex items-center gap-2 h-7 font-black text-lg group-data-[state=collapsed]:hidden">
						<Image src={skevvSVG} alt="Skevv" width={24} height={24} priority />
						<span className="hidden tracking-tight font-mono md:inline">SKEVV</span>
					</Link>
				</h1>

				<SidebarTrigger className="shrink-0" />
			</SidebarHeader>

			<SidebarContent className="gap-0">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="gap-2">
							{links.map(({ to, title, icon }) => {
								const isActive = to === currentPath;

								return (
									<SidebarMenuItem key={title}>
										<SidebarMenuButton asChild isActive={isActive} className="active:bg-gray-200">
											<Link
												href={to}
												className={cn(
													'flex items-center justify-between gap-2 p-2 text-gray-800 font-medium aspect-square rounded-md transition-colors',

													'group-data-[state=collapsed]:justify-center',
													'group-data-[state=collapsed]:gap-0',
													'group-data-[state=collapsed]:px-0',
													'group-data-[state=collapsed]:w-10',
												)}>
												<div className="flex items-center gap-2 group-data-[state=collapsed]:gap-0">
													{icon}
													<span className="hidden group-data-[state=collapsed]:hidden md:inline-block">{title}</span>
												</div>

												{isActive && (
													<div className="hidden mr-2 w-1.5 h-1.5 rounded-full bg-gradient-blue-200 lg:inline-block group-data-[state=collapsed]:hidden" />
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarRail />

			<SidebarFooter>
				<div className="flex flex-col">
					<UserProfile />
				</div>
				<small className="inline-flex items-center gap-1 text-default mx-3 mb-2 mt-1 text-[0.5rem] opacity-50 lg:block group-data-[state=collapsed]:hidden">
					<span>© 2026</span>
					<Link href={route.SERVICE.ROOT} className="hover:underline" target="_blank">
						Skevv
					</Link>
				</small>
			</SidebarFooter>
		</Sidebar>
	);
}
