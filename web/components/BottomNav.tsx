"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Mail, LayoutDashboard } from "lucide-react";

export default function BottomNav() {
	const pathname = usePathname();
	
	const isActive = (path: string) => pathname === path;

	const navItems = [
		{ path: "/", icon: Home, label: "Home" },
		{ path: "/playground", icon: Mail, label: "Playground" },
		{ path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
	];

	return (
		<nav className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 md:hidden">
			<div className="flex items-center gap-6 rounded-full glass border px-8 py-3 shadow-glass">
				{navItems.map(({ path, icon: Icon, label }) => (
					<Link
						key={path}
						href={path}
						className="relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
						aria-label={label}
					>
						<motion.div
							whileTap={{ scale: 0.9 }}
							whileHover={{ scale: 1.1 }}
							transition={{ type: "spring", stiffness: 400, damping: 17 }}
						>
							<Icon
								className={`h-6 w-6 transition-colors ${
									isActive(path) ? "text-primary" : "text-muted-foreground"
								}`}
							/>
						</motion.div>
						{isActive(path) && (
							<motion.div
								layoutId="bottomNav"
								className="absolute -bottom-1 h-1 w-6 rounded-full bg-primary"
								transition={{ type: "spring", stiffness: 380, damping: 30 }}
							/>
						)}
					</Link>
				))}
			</div>
		</nav>
	);
}


