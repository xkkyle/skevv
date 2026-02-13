import { LoaderCircle } from 'lucide-react';

export default function AnimateSpinner({ size = 16 }: { size?: number }) {
	return <LoaderCircle className="animate-spin" size={size} />;
}
