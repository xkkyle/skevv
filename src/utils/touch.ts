function isTouchPrimary() {
	if (typeof window === 'undefined') return false;

	// 터치가 주 입력인 환경(폰/태블릿, 일부 iPad)
	// Touch is main environment to act (phone / tablet, e.g. ipad)
	const coarse = window.matchMedia?.('(pointer: coarse)').matches;
	const noHover = window.matchMedia?.('(hover: none)').matches;

	return Boolean(coarse || noHover);
}

export { isTouchPrimary };
