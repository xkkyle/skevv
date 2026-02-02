/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { debounce } from 'es-toolkit';

interface UseDebouncedEffectProps {
	callback: () => void;
	effectTriggers: unknown[];
	delay?: number;
}

export default function useDebouncedEffect({ callback, effectTriggers, delay = 150 }: UseDebouncedEffectProps) {
	const callbackRef = React.useRef(callback);

	React.useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	React.useEffect(() => {
		const debouncedCallback = debounce(() => {
			callbackRef.current();
		}, delay);

		debouncedCallback();

		return () => {
			debouncedCallback.cancel();
		};
	}, [...effectTriggers, delay]);
}
