"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	return (
		<button
			type="button"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="rounded-md px-3 py-2 text-sm font-medium bg-surface text-text shadow-soft"
			aria-label="Toggle Theme"
		>
			{theme === "dark" ? "🌙" : "☀️"}
		</button>
	);
}


