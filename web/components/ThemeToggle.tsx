"use client";

import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<button
				className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-card hover:shadow-soft"
				aria-label="Toggle theme"
			>
				<Sun className="h-5 w-5" />
			</button>
		);
	}

	const isDark = (theme === "system" ? systemTheme : theme) === "dark";

	return (
		<button
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-card hover:shadow-soft transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			{isDark ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
		</button>
	);
}


