import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { Inter, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";
import type { Metadata } from "next";

const inter = Inter({ 
	subsets: ["latin"], 
	variable: "--font-sans", 
	display: "swap",
	weight: ["400", "500", "600", "700"]
});
const dmSans = DM_Sans({ 
	subsets: ["latin"], 
	variable: "--font-display", 
	display: "swap",
	weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
	title: "AI Email Reply Assistant",
	description: "Draft contextual email replies from Gmail threads with one click. Reply smarter, faster, and politer.",
	icons: {
		icon: "/favicon.ico",
		apple: "/logo.png",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className="font-sans">
			<body className={`${inter.variable} ${dmSans.variable} min-h-dvh bg-background text-foreground antialiased font-sans`}>
				<ThemeProvider>
					<div className="flex min-h-dvh flex-col">
						<NavBar />
						<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
						<BottomNav />
						<Footer />
					</div>
					<Toaster position="top-right" />
				</ThemeProvider>
			</body>
		</html>
	);
}


