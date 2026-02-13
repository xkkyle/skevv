import { AnimateSpinner, Skeleton } from '@/components';

export default function PdfPreviewSkeleton({
	pageCount = 3,
	estimateHeight = 180,
	description = '',
}: {
	pageCount?: number;
	estimateHeight?: number | `${number}%`;
	description?: string;
}) {
	return (
		<>
			{pageCount === 1 ? (
				<Skeleton style={{ height: estimateHeight }} className="ui-flex-center gap-2 w-full">
					<AnimateSpinner size={16} /> {description}
				</Skeleton>
			) : (
				<div className="flex flex-col gap-2">
					{Array.from({ length: pageCount }).map((_, idx) => (
						<div key={idx} style={{ height: estimateHeight }} className="ui-flex-center w-full bg-light rounded-lg">
							<AnimateSpinner size={16} />
						</div>
					))}
				</div>
			)}
		</>
	);
}
