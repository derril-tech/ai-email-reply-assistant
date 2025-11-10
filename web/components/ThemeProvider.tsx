"use client";

import * as React from "react";

type Theme = "light" | "dark";

const ThemeCtx = React.createContext<{
	theme: Theme;
	setTheme: (t: Theme) => void;
}>({
	theme: "light",
	setTheme: () => {},
});

function applyThemeClass(theme: Theme) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	if (theme === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
	}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = React.useState<Theme>("light");

	const setTheme = React.useCallback((t: Theme) => {
		setThemeState(t);
		try {
			localStorage.setItem("theme", t);
		} catch {}
		applyThemeClass(t);
	}, []);

	React.useEffect(() => {
		let initial: Theme = "light";
		try {
			const stored = localStorage.getItem("theme") as Theme | null;
			if (stored === "dark" || stored === "light") {
				initial = stored;
			} else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
				initial = "dark";
			}
		} catch {}
		setTheme(initial);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

	return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
	return React.useContext(ThemeCtx);
}


