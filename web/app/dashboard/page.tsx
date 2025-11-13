'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Clock, TrendingUp, Settings, Loader2, AlertCircle } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
	const { stats, recentDrafts, loading, error } = useDashboard();
	const router = useRouter();

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<p className="text-muted-foreground">{error}</p>
				<Button onClick={() => window.location.reload()}>Retry</Button>
			</div>
		);
	}

	// Format time saved
	const timeSavedDisplay = stats
		? stats.timeSavedMinutes >= 60
			? `${Math.floor(stats.timeSavedMinutes / 60)}h ${stats.timeSavedMinutes % 60}m`
			: `${stats.timeSavedMinutes}m`
		: "0m";

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
							<p className="text-2xl font-bold">{stats?.repliesGenerated || 0}</p>
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
							<p className="text-2xl font-bold">{timeSavedDisplay}</p>
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
							<p className="text-2xl font-bold">{stats?.successRate || 0}%</p>
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
							<p className="text-2xl font-bold">{stats?.activeProjects || 1}</p>
							<p className="text-sm text-muted-foreground">Active Projects</p>
						</div>
					</div>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="p-6">
					<h2 className="text-xl font-semibold font-display mb-4">Recent Drafts</h2>
					{recentDrafts.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<Mail className="h-12 w-12 text-muted-foreground/50 mb-3" />
							<p className="text-muted-foreground">No drafts yet</p>
							<p className="text-sm text-muted-foreground mt-1">
								Generate your first draft in the{" "}
								<button 
									onClick={() => router.push("/playground")} 
									className="text-primary underline"
								>
									Playground
								</button>
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{recentDrafts.map((draft) => (
								<div
									key={draft.id}
									className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors cursor-pointer"
									onClick={() => router.push(`/playground?threadId=${draft.threadId}`)}
								>
									<div className="flex-1">
										<p className="text-sm font-medium line-clamp-1">{draft.subject}</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{new Date(draft.createdAt).toLocaleString()}
										</p>
										<p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
											{draft.snippet}
										</p>
									</div>
									<Button variant="ghost" size="sm">
										View
									</Button>
								</div>
							))}
						</div>
					)}
				</Card>

				<Card className="p-6">
					<h2 className="text-xl font-semibold font-display mb-4">Quick Actions</h2>
					<div className="space-y-3">
						<Button 
							variant="outline" 
							className="w-full justify-start" 
							size="lg"
							onClick={() => router.push("/playground")}
						>
							<Mail className="h-4 w-4 mr-2" />
							Go to Playground
						</Button>
						<Button 
							variant="outline" 
							className="w-full justify-start" 
							size="lg"
							onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
						>
							<Settings className="h-4 w-4 mr-2" />
							Manage Supabase
						</Button>
						<Button 
							variant="outline" 
							className="w-full justify-start" 
							size="lg"
							onClick={() => router.push("/playground")}
						>
							<TrendingUp className="h-4 w-4 mr-2" />
							View All Drafts
						</Button>
					</div>
				</Card>
			</div>
		</div>
	);
}


