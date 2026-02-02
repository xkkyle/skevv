/* eslint-disable react-hooks/refs */
'use client';

import React from 'react';

export default function useIsMountedRef() {
	const ref = React.useRef({ isMounted: true }).current;

	React.useEffect(() => {
		ref.isMounted = true;

		return () => {
			ref.isMounted = false;
		};
	}, [ref]);

	return ref;
}
