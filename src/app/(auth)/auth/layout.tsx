import Link from 'next/link';
import { route } from '@/constants';

export default async function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// const navigate = useNavigate();
	// const { user } = useAuth(); // get login status
	const user = false;

	// useEffect(() => {
	// if (user) {
	// 이미 로그인한 경우 → 메인이나 대시보드로 이동
	// navigate(route.HOME, { replace: true });
	// }
	// }, []);

	// 로그인 상태면 redirect 중이므로 아무 것도 렌더링 안 함
	if (user) return null;

	return (
		<div className="min-h-screen bg-light">
			<div className="flex flex-col flex-1 justify-center mx-auto p-4 max-w-[500px]">
				<h1 className="mt-8 mb-auto text-4xl font-black text-center">
					<Link href={route.SERVICE.ROOT}>SKEVV</Link>
				</h1>
				<p className="mt-8 text-lg text-gray-600 font-medium text-center">Welcome!</p>
				<section>{children}</section>
			</div>
		</div>
	);
}
