'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { ArrowRightIcon, X } from 'lucide-react';
import skevvSVG from '@/public/favicon/favicon.svg';
import { MotionBlock, Button, UserProfile } from '@/components';
import { route } from '@/constant';
import { cn } from '@/lib/utils';

const Menu = ({ className }: { className?: string }) => {
	return (
		<svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="transparent">
			<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8.5h18m-18 7h18"></path>
		</svg>
	);
};

export default function Nav() {
	const [isSideNavOpen, setIsSideNavOpen] = React.useState(false);
	const toggle = () => setIsSideNavOpen(isSideNavOpen => !isSideNavOpen);

	return (
		<>
			<nav id="layout-nav" className={cn('fixed flex justify-center w-full pt-3 px-3 z-40 sm:hidden', isSideNavOpen ? 'bg-white' : '')}>
				<div className="flex justify-between items-center gap-4 w-full px-4 py-3 min-h-[var(--global-layout-nav-height)] border border-muted rounded-full bg-white backdrop-blur-lg">
					<h1 className="inline-flex justify-center items-center" onClick={() => setIsSideNavOpen(false)}>
						<Link href={route.SERVICE.ROOT} className="inline-flex items-center gap-2 h-7 shrink-0">
							<Image src={skevvSVG} alt={'Skevv'} width={24} height={24} priority />
							<span className="font-black text-xl">SKEVV</span>
						</Link>
					</h1>
					<Button
						type="button"
						size="icon-lg"
						variant="ghost"
						className={cn(`rounded-full`, isSideNavOpen ? 'bg-light' : 'bg-none')}
						onClick={toggle}>
						{isSideNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</Button>
				</div>
			</nav>

			<div
				id="layout-side-navigation"
				className={cn(
					`fixed top-[calc(var(--global-layout-padding)+var(--global-layout-nav-height))] left-0 right-0 flex flex-col px-3 w-full bg-white z-20 overflow-hidden transition-[max-height] duration-200 ease-[cubic-bezier(0.22, 1, 0.36, 1)] md:hidden`,
					isSideNavOpen ? 'max-h-full' : 'max-h-0',
				)}>
				<MotionBlock onClick={toggle} className="rounded-lg">
					<Link
						href={route.SERVICE.WRITE}
						className="flex justify-between items-center px-3 w-full min-h-[60px] rounded-lg font-medium cursor-pointer active:bg-light">
						<span>New Merge</span>
						<ArrowRightIcon size={20} />
					</Link>
				</MotionBlock>
				<MotionBlock onClick={toggle} className="rounded-lg">
					<Link
						href={route.SERVICE.ARCHIVES}
						className="flex justify-between items-center px-3 w-full min-h-[60px] font-medium rounded-lg cursor-pointer active:bg-light">
						Archives
						<ArrowRightIcon size={20} />
					</Link>
				</MotionBlock>
				<div className="flex justify-between items-center mx-2 min-h-[60px] lg:mx-0">
					<UserProfile inSideNav={true} />
				</div>
			</div>
			<div
				id="layout-overlay"
				onClick={toggle}
				className={cn(
					`fixed top-0 right-0 bottom-0 h-full bg-muted z-10 transition-opacity will-change-transform duration-300 ease-[cubic-bezier(0.22, 1, 0.36, 1)] cursor-pointer md:hidden`,
					isSideNavOpen ? 'left-0 opacity-80' : 'slide-out-to-bottom-full opacity-0',
				)}
			/>
		</>
	);
}
