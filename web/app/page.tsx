import HeroVideo from "@/components/hero/HeroVideo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
	return (
		<main className="space-y-10">
			<HeroVideo>
				{/* Text container with subtle backdrop for better readability */}
				<div className="relative">
					{/* Subtle backdrop blur for text separation */}
					<div className="absolute inset-0 bg-background/20 backdrop-blur-sm rounded-3xl -z-10 scale-110"></div>
					
					<h1 className="text-4xl md:text-6xl font-semibold tracking-tight font-display text-foreground drop-shadow-lg">
						Reply smarter. <span className="text-white">Faster.</span> Politer.
					</h1>
					<p className="mt-4 max-w-2xl mx-auto text-foreground/90 leading-relaxed drop-shadow-md text-center">
						Draft contextual replies from Gmail threads with one click.
					</p>
					<div className="mt-6 flex gap-3 justify-center">
						<Link href="/playground">
							<Button 
								size="lg" 
								className="bg-[#05c290] hover:bg-[#04ab7e] text-white shadow-soft font-semibold"
							>
								Connect Gmail
							</Button>
						</Link>
						<Link href="/playground">
							<Button 
								size="lg" 
								className="bg-[#e63764] hover:bg-[#d32d58] text-white shadow-soft font-semibold"
							>
								See Playground
							</Button>
						</Link>
					</div>
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


