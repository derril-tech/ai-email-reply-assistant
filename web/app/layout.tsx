import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { Inter, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} ${dmSans.variable} min-h-dvh bg-background text-foreground antialiased`}>
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


