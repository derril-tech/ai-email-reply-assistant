import Link from "next/link";
import { Mail, Github, Linkedin } from "lucide-react";

export default function Footer() {
	return (
		<footer className="w-full border-t border-border bg-card pb-20 md:pb-0">
			<div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-3 md:gap-6">
				<div>
					<h3 className="font-display text-base font-semibold">AI Email Reply Assistant</h3>
					<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
						Reply Smarter. Faster. Politer.
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Created by Derril Filemon
					</p>
				</div>
				<div>
					<h3 className="font-display text-base font-semibold">Quick Links</h3>
					<ul className="mt-3 space-y-2 text-sm">
						<li>
							<Link 
								href="/" 
								className="inline-block text-muted-foreground transition-all hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
							>
								Home
							</Link>
						</li>
						<li>
							<Link 
								href="/playground" 
								className="inline-block text-muted-foreground transition-all hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
							>
								Playground
							</Link>
						</li>
						<li>
							<Link 
								href="/dashboard" 
								className="inline-block text-muted-foreground transition-all hover:text-primary hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
							>
								Dashboard
							</Link>
						</li>
					</ul>
				</div>
				<div>
					<h3 className="font-display text-base font-semibold">Connect</h3>
					<div className="mt-3 flex flex-col gap-2 text-sm">
						<a 
							href="mailto:cashcrumbs@gmail.com" 
							className="inline-flex items-center gap-2 text-muted-foreground transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
						>
							<Mail className="h-4 w-4" />
							cashcrumbs@gmail.com
						</a>
						<a 
							href="https://github.com/derril-tech" 
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-muted-foreground transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
						>
							<Github className="h-4 w-4" />
							GitHub
						</a>
						<a 
							href="https://www.linkedin.com/in/derril-filemon-a31715319" 
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-muted-foreground transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
						>
							<Linkedin className="h-4 w-4" />
							LinkedIn
						</a>
					</div>
				</div>
			</div>
			<div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
				© {new Date().getFullYear()} AI Email Reply Assistant. All rights reserved.
			</div>
		</footer>
	);
}


