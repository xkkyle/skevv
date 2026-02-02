'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui';
import { useDropzoneFiles, useMediaQuery } from '@/hooks';
import { screenSize } from '@/constant';

interface FileResetConfirmContextProps {
	isOpen: boolean;
	toggle: React.Dispatch<React.SetStateAction<boolean>>;
}

function TriggerButton({ open, ...props }: { open: () => void }) {
	return (
		<Button type="button" size="icon-md" onClick={open} className="rounded-full" {...props}>
			<RotateCcw size={21} />
		</Button>
	);
}

export default function FileResetConfirmContext({ isOpen, toggle }: FileResetConfirmContextProps) {
	const { onReset } = useDropzoneFiles();
	const isMobile = useMediaQuery(screenSize.MAX_SM);

	const title = 'Reset Current Files';
	const description = 'Do you really mind to reset files?';

	const open = () => toggle(true);
	const close = () => toggle(false);

	return (
		<>
			{isMobile ? (
				<Drawer open={isOpen} onOpenChange={toggle}>
					<DrawerTrigger asChild>
						<TriggerButton open={open} />
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader className="p-3 text-left">
							<DrawerTitle className="text-start text-lg">{title}</DrawerTitle>
							<DrawerDescription className="text-start">{description}</DrawerDescription>
						</DrawerHeader>
						<DrawerFooter className="p-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
							<Button type="button" size="lg" onClick={onReset} className="col-span-1">
								Confirm
							</Button>
							<DrawerClose asChild>
								<Button type="button" variant="outline" size="lg" onClick={close} className="col-span-1">
									Cancel
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			) : (
				<Dialog open={isOpen} onOpenChange={toggle}>
					<DialogTrigger asChild>
						<TriggerButton open={open} />
					</DialogTrigger>
					<DialogContent className="w-[500px]" aria-describedby="File Reset Confirm Dialog Content">
						<DialogHeader>
							<DialogTitle className="text-lg">{title}</DialogTitle>
							<DialogDescription className="text-start">{description}</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline" size="lg" onClick={close}>
									Cancel
								</Button>
							</DialogClose>

							<Button type="button" size="lg" onClick={onReset}>
								Confirm
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
