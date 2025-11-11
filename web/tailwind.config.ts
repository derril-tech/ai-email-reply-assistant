import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./app/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./hooks/**/*.{ts,tsx}",
		"./lib/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", "system-ui", "sans-serif"],
				display: ["var(--font-display)", "system-ui", "sans-serif"],
			},
			colors: {
				// New 2025 brand colors
				pink: { DEFAULT: "#EF476F" },
				gold: { DEFAULT: "#FFD166", dark: "#E6B85C" },
				teal: { DEFAULT: "#06D6A0" },
				azure: { DEFAULT: "#118AB2" },
				navy: { DEFAULT: "#073B4C" },
				
				// Semantic shadcn/ui tokens (via CSS vars)
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			spacing: {
				18: "4.5rem",
				22: "5.5rem",
			},
			borderRadius: {
				xl: "0.9rem",
				"2xl": "1.25rem",
			},
			boxShadow: {
				soft: "0 8px 28px rgba(2, 8, 23, 0.08)",
				glass: "0 10px 40px rgba(2, 8, 23, 0.15)",
			},
			backdropBlur: {
				xs: "2px",
			},
			animation: {
				"fade-in": "fade-in 300ms ease-out",
				"slide-up": "slide-up 300ms ease-out",
			},
			keyframes: {
				"fade-in": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				"slide-up": {
					from: { transform: "translateY(8px)", opacity: "0" },
					to: { transform: "translateY(0)", opacity: "1" },
				},
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;


