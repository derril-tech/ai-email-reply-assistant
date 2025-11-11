import HeroVideo from "@/components/hero/HeroVideo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
	return (
		<main className="space-y-10">
			<HeroVideo>
				<h1 className="text-4xl md:text-6xl font-semibold tracking-tight font-display text-foreground">
					Reply smarter. <span className="text-primary">Faster.</span> Politer.
				</h1>
				<p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
					Draft contextual replies from Gmail threads with one click.
				</p>
				<div className="mt-6 flex gap-3">
					<Link href="/playground">
						<Button size="lg" className="shadow-soft">
							Connect Gmail
						</Button>
					</Link>
					<Link href="/playground">
						<Button variant="outline" size="lg">
							See Playground
						</Button>
					</Link>
				</div>
			</HeroVideo>

			<section className="space-y-6">
				<h2 className="text-3xl font-semibold font-display text-center">
					How It Works
				</h2>
				<div className="grid gap-6 md:grid-cols-3">
					<div className="glass rounded-2xl border p-6">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-4">
							1
						</div>
						<h3 className="text-xl font-medium mb-2">Connect Gmail</h3>
						<p className="text-muted-foreground">
							Securely authorize access to your Gmail threads.
						</p>
					</div>
					<div className="glass rounded-2xl border p-6">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground font-bold text-lg mb-4">
							2
						</div>
						<h3 className="text-xl font-medium mb-2">Select Thread</h3>
						<p className="text-muted-foreground">
							Choose an email thread that needs a reply.
						</p>
					</div>
					<div className="glass rounded-2xl border p-6">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold text-lg mb-4">
							3
						</div>
						<h3 className="text-xl font-medium mb-2">Generate Reply</h3>
						<p className="text-muted-foreground">
							AI drafts a polite, contextual reply instantly.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}


