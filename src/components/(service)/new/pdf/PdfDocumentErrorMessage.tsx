import { CircleX } from 'lucide-react';

export default function PdfDocumentErrorMessage() {
	return (
		<div className="inline-flex items-center gap-2 p-3 w-full bg-red-100 text-red-400 rounded-full">
			<CircleX size={18} /> Error happened to get a file
		</div>
	);
}
