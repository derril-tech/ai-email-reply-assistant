export default function BottomNav() {
	return (
		<nav className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 md:hidden">
			<div className="flex items-center gap-6 rounded-full bg-white/80 px-6 py-3 shadow-glass backdrop-blur-lg dark:bg-neutral-900/70">
				<a href="/" className="text-sm">🏠</a>
				<a href="/playground" className="text-sm">✉️</a>
				<a href="/dashboard" className="text-sm">⚙️</a>
			</div>
		</nav>
	);
}


