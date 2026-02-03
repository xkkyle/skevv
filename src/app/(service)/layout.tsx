import { SidebarProvider } from '@/components';
import { AppSidebar, Main, Nav } from '@/components/layout';
import { ReactQueryProvider } from '@/providers';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex flex-col min-h-screen">
			<div className="flex flex-1">
				<ReactQueryProvider>
					<SidebarProvider>
						<AppSidebar />
						<Nav />
						<Main>{children}</Main>
					</SidebarProvider>
				</ReactQueryProvider>
			</div>
		</div>
	);
}
