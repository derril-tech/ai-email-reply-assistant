\"use client\";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export default function NavBar() {
	const [open, setOpen] = useState(false);
	return (
		<nav className="w-full border-b border-border bg-gradient-to-r from-primary to-secondary">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<Link href="/" className="text-lg font-semibold text-text heading">
					AI Email Reply Assistant
				</Link>
				<div className="hidden items-center gap-4 md:flex">
					<Link href="/playground" className="text-sm text-text">
						Playground
					</Link>
					<Link href="/dashboard" className="text-sm text-text">
						Dashboard
					</Link>
					<ThemeToggle />
				</div>
				<button
					className="md:hidden rounded-md bg-surface/70 px-3 py-2 text-sm text-text shadow-soft"
					onClick={() => setOpen(true)}
					aria-label="Open menu"
				>
					☰
				</button>
			</div>
			{open && (
				<div
					className="fixed inset-0 z-50 bg-black/30"
					onClick={() => setOpen(false)}
					aria-hidden="true"
				>
					<div
						className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-surface p-6 shadow-glass"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
					>
						<div className="mx-auto flex w-full max-w-6xl items-center justify-between">
							<div className="flex items-center gap-4">
								<Link href="/playground" className="text-sm text-text" onClick={() => setOpen(false)}>
									Playground
								</Link>
								<Link href="/dashboard" className="text-sm text-text" onClick={() => setOpen(false)}>
									Dashboard
								</Link>
							</div>
							<ThemeToggle />
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}


