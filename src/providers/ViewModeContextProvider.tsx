'use client';

import React from 'react';

type ViewMode = 'single' | 'dual';

interface ViewModeContextType {
	viewMode: ViewMode;
	setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = React.createContext<ViewModeContextType | null>(null);

export function useViewMode() {
	const context = React.useContext(ViewModeContext);

	if (!context) {
		throw new Error('[useViewMode] must be used within [ViewModeContextProvider]');
	}

	return context;
}

export function ViewModeContextProvider({ children }: { children: React.ReactNode }) {
	const [viewMode, setViewMode] = React.useState<ViewMode>('single');

	return <ViewModeContext.Provider value={{ viewMode, setViewMode }}>{children}</ViewModeContext.Provider>;
}
