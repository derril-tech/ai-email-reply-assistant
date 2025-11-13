"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, Home, Mail, LayoutDashboard } from "lucide-react";
import Image from "next/image";

export default function NavBar() {
	const [open, setOpen] = useState(false);
	return (
		<nav className="w-full border-b border-border bg-card backdrop-blur-sm sticky top-0 z-50">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 relative">
				<Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold transition-all hover:opacity-90">
					<Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
					<span className="hidden sm:inline">AI Email Reply Assistant</span>
					<span className="sm:hidden">Email AI</span>
				</Link>
				<div className="hidden items-center gap-6 md:flex">
					<Link href="/playground" className="text-sm hover:text-primary transition-colors">
						Playground
					</Link>
					<Link href="/dashboard" className="text-sm hover:text-primary transition-colors">
						Dashboard
					</Link>
					<ThemeToggle />
					<button 
						className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground" 
						aria-label="User profile (Coming soon)"
						title="User profile (Coming soon)"
						onClick={() => {
							// Future: Open user profile menu
							alert("User profile feature coming soon!");
						}}
					>
						<User className="h-4 w-4" />
					</button>
				</div>
				<button
					className="md:hidden rounded-xl bg-muted px-3 py-2 text-sm transition-all hover:bg-accent"
					onClick={() => setOpen(true)}
					aria-label="Open menu"
				>
					<Menu className="h-5 w-5" />
				</button>
			</div>
			{/* Mobile Dropdown Menu */}
			<AnimatePresence>
				{open && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="fixed inset-0 z-40 md:hidden"
							onClick={() => setOpen(false)}
							aria-hidden="true"
						/>
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="absolute top-full right-0 mt-2 w-56 z-50 md:hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="rounded-xl bg-card border border-border shadow-lg overflow-hidden">
								<div className="flex flex-col p-2">
									<Link 
										href="/" 
										className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors" 
										onClick={() => setOpen(false)}
									>
										<Home className="h-4 w-4" />
										Home
									</Link>
									<Link 
										href="/playground" 
										className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors" 
										onClick={() => setOpen(false)}
									>
										<Mail className="h-4 w-4" />
										Playground
									</Link>
									<Link 
										href="/dashboard" 
										className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-lg transition-colors" 
										onClick={() => setOpen(false)}
									>
										<LayoutDashboard className="h-4 w-4" />
										Dashboard
									</Link>
									<div className="border-t border-border my-2"></div>
									<div className="flex items-center justify-between px-4 py-3">
										<span className="text-sm text-muted-foreground">Theme</span>
										<ThemeToggle />
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</nav>
	);
}


