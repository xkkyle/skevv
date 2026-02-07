const getInitialWidth = ({ mediaQuery, maxSize }: { mediaQuery: boolean; maxSize: number }) => {
	return typeof window !== 'undefined' ? (mediaQuery ? 300 : Math.min(window.innerWidth * 0.5, maxSize)) : 300;
};

export { getInitialWidth };
