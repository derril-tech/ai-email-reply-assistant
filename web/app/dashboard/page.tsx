import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Clock, TrendingUp, Settings } from "lucide-react";

export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<section>
				<h1 className="text-3xl font-semibold font-display">Dashboard</h1>
				<p className="mt-2 text-muted-foreground">Track your email reply activity and manage settings.</p>
			</section>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
							<Mail className="h-6 w-6 text-primary" />
						</div>
						<div>
							<p className="text-2xl font-bold">24</p>
							<p className="text-sm text-muted-foreground">Replies Generated</p>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
							<Clock className="h-6 w-6 text-secondary" />
						</div>
						<div>
							<p className="text-2xl font-bold">12m</p>
							<p className="text-sm text-muted-foreground">Time Saved</p>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
							<TrendingUp className="h-6 w-6 text-accent" />
						</div>
						<div>
							<p className="text-2xl font-bold">89%</p>
							<p className="text-sm text-muted-foreground">Success Rate</p>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink/10">
							<Settings className="h-6 w-6 text-pink" />
						</div>
						<div>
							<p className="text-2xl font-bold">3</p>
							<p className="text-sm text-muted-foreground">Active Projects</p>
						</div>
					</div>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="p-6">
					<h2 className="text-xl font-semibold font-display mb-4">Recent Drafts</h2>
					<div className="space-y-3">
						{[
							{ subject: "Q3 Planning", time: "2 hours ago" },
							{ subject: "Invoice #3421", time: "5 hours ago" },
							{ subject: "Team Meeting Notes", time: "1 day ago" },
						].map((draft, i) => (
							<div
								key={i}
								className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors"
							>
								<div>
									<p className="text-sm font-medium">{draft.subject}</p>
									<p className="text-xs text-muted-foreground">{draft.time}</p>
								</div>
								<Button variant="ghost" size="sm">
									View
								</Button>
							</div>
						))}
					</div>
				</Card>

				<Card className="p-6">
					<h2 className="text-xl font-semibold font-display mb-4">Quick Actions</h2>
					<div className="space-y-3">
						<Button variant="outline" className="w-full justify-start" size="lg">
							<Mail className="h-4 w-4 mr-2" />
							Connect New Gmail Account
						</Button>
						<Button variant="outline" className="w-full justify-start" size="lg">
							<Settings className="h-4 w-4 mr-2" />
							Manage Settings
						</Button>
						<Button variant="outline" className="w-full justify-start" size="lg">
							<TrendingUp className="h-4 w-4 mr-2" />
							View Analytics
						</Button>
					</div>
				</Card>
			</div>
		</div>
	);
}


