import Link from 'next/link';
import { ChevronDown, ChevronUp, LogIn, LogOut, Settings, Sparkle, User } from 'lucide-react';
import {
	MotionBlock,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Button,
} from '@/components';
import { useUserStore } from '@/store';
import { route } from '@/constants';
import { cn } from '@/lib/utils';

interface UserProfileProps {
	inSideNav?: boolean;
}

export default function UserProfile({ inSideNav = false }: UserProfileProps) {
	const { userState } = useUserStore();

	return (
		<>
			{userState?.user ? (
				<DropdownMenu>
					<DropdownMenuTrigger
						className={cn(
							`flex items-center gap-2 py-2 px-3 w-full rounded-lg hover:bg-muted transition-colors cursor-pointer lg:justify-between`,
							inSideNav ? 'justify-between' : 'justify-center',
						)}
						aria-label="Open Profile Menu">
						<div className="flex items-center gap-2">
							<div className="ui-flex-center w-4 h-4 rounded-[9999px] bg-gray-900">
								{/* <img src="#" alt="not yet" className="block w-full h-full" /> */}
							</div>
							<span className={cn(`font-bold lg:inline`, inSideNav ? 'inline-block' : 'hidden')}>User</span>
						</div>
						<span className={cn(`lg:inline`, inSideNav ? 'inline-block' : 'hidden')}>
							{inSideNav ? <ChevronDown size={18} className="text-gray-900" /> : <ChevronUp size={18} className="text-gray-900" />}
						</span>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel className="text-gray-500">kylekwon.dev@gmail.com</DropdownMenuLabel>
						<DropdownMenuItem className="cursor-pointer">
							<Link
								href={route.SERVICE.SETTINGS.MYACCOUNT_PROFILE}
								className="flex items-center gap-2 w-full text-gray-800 font-medium rounded-md">
								<User size={18} className="text-gray-900" />
								<span>My Profile</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer">
							<Link
								href={route.SERVICE.SETTINGS.SUBSCRIPTION}
								className="flex items-center gap-2 w-full text-gray-800 font-medium rounded-md">
								<Sparkle size={18} className="text-gray-900" />
								<span>Subscription</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-pointer">
							<Link
								href={route.SERVICE.SETTINGS.MYACCOUNT_PROFILE}
								className="flex items-center gap-2 w-full text-gray-800 font-medium rounded-md">
								<Settings size={18} className="text-gray-900" />
								<span>Settings</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="cursor-pointer">
							<div className="flex items-center gap-2 w-full text-gray-800 font-medium rounded-md">
								<LogOut size={18} className="text-gray-900" />
								Sign Out
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<MotionBlock className="ui-flex-center w-full">
					<Button variant="outline" className="w-full" asChild>
						<Link href={route.AUTH.LOGIN}>
							<LogIn size={18} />
							<span className="group-data-[state=collapsed]:hidden">Get started</span>
						</Link>
					</Button>
				</MotionBlock>
			)}
		</>
	);
}
