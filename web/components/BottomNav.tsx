"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function BottomNav() {
	const pathname = usePathname();
	
	const isActive = (path: string) => pathname === path;

	return (
		<nav className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 md:hidden">
			<div className="flex items-center gap-6 rounded-full bg-white/80 px-8 py-3 shadow-glass backdrop-blur-lg dark:bg-neutral-900/70">
				<Link href="/" className="relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
					<motion.span
						whileTap={{ scale: 0.9 }}
						whileHover={{ scale: 1.1 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
						className={`text-2xl ${isActive("/") ? "filter drop-shadow-lg" : ""}`}
					>
						🏠
					</motion.span>
					{isActive("/") && (
						<motion.div
							layoutId="bottomNav"
							className="absolute -bottom-1 h-1 w-6 rounded-full bg-primary"
							transition={{ type: "spring", stiffness: 380, damping: 30 }}
						/>
					)}
				</Link>
				<Link href="/playground" className="relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
					<motion.span
						whileTap={{ scale: 0.9 }}
						whileHover={{ scale: 1.1 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
						className={`text-2xl ${isActive("/playground") ? "filter drop-shadow-lg" : ""}`}
					>
						✉️
					</motion.span>
					{isActive("/playground") && (
						<motion.div
							layoutId="bottomNav"
							className="absolute -bottom-1 h-1 w-6 rounded-full bg-primary"
							transition={{ type: "spring", stiffness: 380, damping: 30 }}
						/>
					)}
				</Link>
				<Link href="/dashboard" className="relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
					<motion.span
						whileTap={{ scale: 0.9 }}
						whileHover={{ scale: 1.1 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
						className={`text-2xl ${isActive("/dashboard") ? "filter drop-shadow-lg" : ""}`}
					>
						⚙️
					</motion.span>
					{isActive("/dashboard") && (
						<motion.div
							layoutId="bottomNav"
							className="absolute -bottom-1 h-1 w-6 rounded-full bg-primary"
							transition={{ type: "spring", stiffness: 380, damping: 30 }}
						/>
					)}
				</Link>
			</div>
		</nav>
	);
}


