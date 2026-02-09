'use client';

import React from 'react';

interface PreviewScrollContextType {
	scrollToPage: (pageId: string) => void;
}

const PreviewScrollContext = React.createContext<PreviewScrollContextType | null>(null);

export function usePreviewScroll() {
	const context = React.useContext(PreviewScrollContext);

	if (!context) {
		throw new Error('[usePreviewScroll] must be used within [PreviewScrollContextProvider]');
	}

	return context;
}

export function PreviewScrollProvider({ children }: { children: React.ReactNode }) {
	const scrollToPage = React.useCallback((pageId: string) => {
		const pageElement = document.getElementById(pageId);

		if (pageElement) {
			pageElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
				inline: 'nearest',
			});
		}
	}, []);

	return <PreviewScrollContext.Provider value={{ scrollToPage }}>{children}</PreviewScrollContext.Provider>;
}
