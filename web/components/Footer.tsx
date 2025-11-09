export default function Footer() {
	return (
		<footer className="w-full border-t border-border bg-background">
			<div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-3">
				<div>
					<h3 className="text-sm font-semibold text-text">AI Email Reply Assistant</h3>
					<p className="mt-2 text-sm text-text/70">Reply Smarter. Faster. Politer.</p>
				</div>
				<div>
					<h3 className="text-sm font-semibold text-text">Quick Links</h3>
					<ul className="mt-2 space-y-1 text-sm text-text/70">
						<li>Home</li>
						<li>Playground</li>
						<li>Settings</li>
					</ul>
				</div>
				<div>
					<h3 className="text-sm font-semibold text-text">Contact</h3>
					<p className="mt-2 text-sm text-text/70">hello@example.com</p>
				</div>
			</div>
			<div className="border-t border-border py-4 text-center text-xs text-text/60">
				© {new Date().getFullYear()}
			</div>
		</footer>
	);
}


