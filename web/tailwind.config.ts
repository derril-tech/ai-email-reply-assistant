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
			colors: {
				primary: {
					DEFAULT: "#5B86E5",
					dark: "#4472CA",
					fg: "#FFFFFF",
				},
				secondary: {
					DEFAULT: "#FFD166",
					dark: "#E6B85C",
					fg: "#1A1A1A",
				},
				base: {
					DEFAULT: "#F9FAFB",
					dark: "#0D1117",
				},
				surface: {
					DEFAULT: "#FFFFFF",
					dark: "#1E222A",
				},
				text: {
					DEFAULT: "#1A1A1A",
					dark: "#F4F4F4",
					muted: "#6B7280",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primaryToken: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondaryToken: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
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
			borderRadius: {
				xl: "1rem",
				"2xl": "1.25rem",
			},
			boxShadow: {
				soft: "0 8px 30px rgba(0,0,0,0.06)",
				glass: "0 10px 40px rgba(0,0,0,0.12)",
			},
			backdropBlur: {
				xs: "2px",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;


