"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User } from "lucide-react";
import Image from "next/image";

export default function NavBar() {
	const [open, setOpen] = useState(false);
	return (
		<nav className="w-full border-b border-border bg-card backdrop-blur-sm">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
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
			<AnimatePresence>
				{open && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
							onClick={() => setOpen(false)}
							aria-hidden="true"
						/>
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t p-6 shadow-glass"
							onClick={(e) => e.stopPropagation()}
							role="dialog"
							aria-modal="true"
						>
							<div className="flex flex-col gap-4">
								<Link href="/playground" className="text-base hover:text-primary transition-colors" onClick={() => setOpen(false)}>
									Playground
								</Link>
								<Link href="/dashboard" className="text-base hover:text-primary transition-colors" onClick={() => setOpen(false)}>
									Dashboard
								</Link>
								<div className="flex items-center justify-between pt-4 border-t border-border">
									<span className="text-sm text-muted-foreground">Theme</span>
									<ThemeToggle />
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</nav>
	);
}


