'use client';

import React from 'react';
import { KeyboardSensor, PointerSensor, TouchSensor, useSensors, useSensor } from '@dnd-kit/core';
import { isTouchPrimary } from '@/utils/touch';

export default function useAdaptiveSensors() {
	const [touchPrimary, setTouchPrimary] = React.useState(false);

	React.useEffect(() => {
		const update = () => setTouchPrimary(isTouchPrimary());
		update();

		// 입력 방식 변화(iPad에 트랙패드 연결/해제 등)에 대응
		const pointerMediaQuery = window.matchMedia('(pointer: coarse)');
		const hoverMediaQuery = window.matchMedia('(hover: none)');

		pointerMediaQuery.addEventListener?.('change', update);
		hoverMediaQuery.addEventListener?.('change', update);

		return () => {
			pointerMediaQuery.removeEventListener?.('change', update);
			hoverMediaQuery.removeEventListener?.('change', update);
		};
	}, []);

	const touchSensors = useSensors(
		useSensor(TouchSensor, {
			activationConstraint: { delay: 120, tolerance: 6 },
		}),
		useSensor(KeyboardSensor),
	);

	const pointerSensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 6 },
		}),
		useSensor(KeyboardSensor),
	);

	return { sensors: touchPrimary ? touchSensors : pointerSensors, sensorType: touchPrimary ? 'touch' : 'pointer' };
}
