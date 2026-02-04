import { Skeleton } from '@/components';

function Element() {
	return <Skeleton className="mb-2 min-h-[50px] w-[calc(100%-8px)] rounded-lg bg-light" />;
}

export default function FileInsertSkeleton({ filesLength = 1 }: { filesLength: number }) {
	return (
		<>
			{filesLength === 1 ? (
				<Element />
			) : (
				<div className="flex flex-col flex-1 shrink-0 items-center w-full">
					{Array.from({ length: filesLength }, (_, idx) => (
						<Element key={idx} />
					))}
				</div>
			)}
		</>
	);
}
