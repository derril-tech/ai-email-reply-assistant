"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar() {
	const [open, setOpen] = useState(false);
	return (
		<nav className="w-full border-b border-border bg-gradient-to-r from-primary to-secondary/90 backdrop-blur-sm">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link href="/" className="font-display text-lg font-semibold text-white transition-all hover:opacity-90">
					AI Email Reply Assistant
				</Link>
				<div className="hidden items-center gap-6 md:flex">
					<Link href="/playground" className="text-sm text-white/90 hover:text-white transition-colors">
						Playground
					</Link>
					<Link href="/dashboard" className="text-sm text-white/90 hover:text-white transition-colors">
						Dashboard
					</Link>
					<ThemeToggle />
					<button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30" aria-label="User menu">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
					</button>
				</div>
				<button
					className="md:hidden rounded-md bg-white/20 px-3 py-2 text-sm text-white shadow-soft transition-all hover:bg-white/30"
					onClick={() => setOpen(true)}
					aria-label="Open menu"
				>
					☰
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
							className="fixed inset-0 z-50 bg-black/30"
							onClick={() => setOpen(false)}
							aria-hidden="true"
						/>
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-surface p-6 shadow-glass"
							onClick={(e) => e.stopPropagation()}
							role="dialog"
							aria-modal="true"
						>
							<div className="flex flex-col gap-4">
								<Link href="/playground" className="text-base text-text hover:text-primary transition-colors" onClick={() => setOpen(false)}>
									Playground
								</Link>
								<Link href="/dashboard" className="text-base text-text hover:text-primary transition-colors" onClick={() => setOpen(false)}>
									Dashboard
								</Link>
								<div className="flex items-center justify-between pt-4 border-t border-border">
									<span className="text-sm text-text/70">Theme</span>
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


