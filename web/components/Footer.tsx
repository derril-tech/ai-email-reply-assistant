import Link from "next/link";

export default function Footer() {
	return (
		<footer className="w-full border-t border-border bg-gradient-to-b from-background to-base pb-20 md:pb-0">
			<div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-3 md:gap-6">
				<div>
					<h3 className="font-display text-base font-semibold text-text">AI Email Reply Assistant</h3>
					<p className="mt-3 text-sm leading-relaxed text-text/70">Reply Smarter. Faster. Politer.</p>
				</div>
				<div>
					<h3 className="font-display text-base font-semibold text-text">Quick Links</h3>
					<ul className="mt-3 space-y-2 text-sm text-text/70">
						<li>
							<Link href="/" className="inline-block transition-all hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
								Home
							</Link>
						</li>
						<li>
							<Link href="/playground" className="inline-block transition-all hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
								Playground
							</Link>
						</li>
						<li>
							<Link href="/dashboard" className="inline-block transition-all hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
								Settings
							</Link>
						</li>
					</ul>
				</div>
				<div>
					<h3 className="font-display text-base font-semibold text-text">Contact</h3>
					<a 
						href="mailto:hello@example.com" 
						className="mt-3 inline-block text-sm text-text/70 transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
					>
						hello@example.com
					</a>
				</div>
			</div>
			<div className="border-t border-border py-6 text-center text-xs text-text/60">
				© {new Date().getFullYear()} AI Email Reply Assistant
			</div>
		</footer>
	);
}


