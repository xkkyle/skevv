import React from 'react';

interface UseKeyboardTriggerProps {
	handler: (e: KeyboardEvent) => void;
	effectTriggers?: (number | string | boolean)[];
}

export default function useKeyboardTrigger({ handler, effectTriggers = [] }: UseKeyboardTriggerProps) {
	React.useEffect(() => {
		window.addEventListener('keydown', handler);

		return () => window.removeEventListener('keydown', handler);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...effectTriggers]);
}
