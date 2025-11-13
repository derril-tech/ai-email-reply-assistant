"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAgent } from "../../hooks/useAgent";
import { useGmailAuth } from "../../hooks/useGmailAuth";
import { useThreads } from "../../hooks/useThreads";
import LoaderDots from "../../components/LoaderDots";
import EmptyState from "../../components/EmptyState";
import { DraftEditor } from "../../components/DraftEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, Copy, Send, RefreshCw, Mail } from "lucide-react";

type UIState = "hero" | "threadPicker" | "compose" | "result";

type DraftHistory = {
	id: string;
	threadSubject: string;
	text: string;
	createdAt: string;
};

function PlaygroundContent() {
	const searchParams = useSearchParams();
	const [ui, setUi] = useState<UIState>("hero");
	const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
	const [tone, setTone] = useState<"friendly" | "formal" | "brief">("friendly");
	const [length, setLength] = useState<number>(150);
	const [bullets, setBullets] = useState<boolean>(false);
	const [showHistory, setShowHistory] = useState<boolean>(false);
	const [history, setHistory] = useState<DraftHistory[]>([]);
	const { run, status, result } = useAgent("default");
	const { isAuthorized, loading: authLoading, connectGmail } = useGmailAuth("default");
	const { threads, loading: threadsLoading, error: threadsError, refetch: refetchThreads } = useThreads("default");

	// Check for OAuth success in URL
	useEffect(() => {
		const connected = searchParams?.get("connected");
		if (connected === "true") {
			toast.success("Gmail connected successfully!");
			// Refetch threads after OAuth success
			refetchThreads();
			// Optionally navigate to thread picker
			setUi("threadPicker");
		}
	}, [searchParams]);

	useEffect(() => {
		if (status === "done") {
			toast.success("Reply generated successfully");
			if (result?.text && selectedThreadId) {
				const threadSubject = threads.find((t) => t.id === selectedThreadId)?.subject || "Unknown";
				setHistory((prev) => [
					{
						id: Date.now().toString(),
						threadSubject,
						text: result.text,
						createdAt: new Date().toLocaleString(),
					},
					...prev,
				]);
			}
		}
		if (status === "error") toast.error("Failed to generate reply");
	}, [status, result, selectedThreadId]);

	const section = useMemo(
		() => ({
			initial: { opacity: 0, y: 12 },
			animate: { opacity: 1, y: 0 },
			exit: { opacity: 0, y: -12 },
			transition: { type: "spring", stiffness: 300, damping: 25 },
		}),
		[]
	);

	return (
		<div className="relative grid gap-6">
			{/* History Sidebar Toggle */}
			{history.length > 0 && (
				<button
					onClick={() => setShowHistory(!showHistory)}
					className="fixed right-4 top-20 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glass transition-all hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring md:hidden"
					aria-label="Toggle history"
				>
					<History className="h-5 w-5" />
				</button>
			)}

			{/* History Sidebar */}
			<AnimatePresence>
				{showHistory && history.length > 0 && (
					<motion.aside
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="fixed right-0 top-16 bottom-0 z-40 w-80 overflow-y-auto glass border-l p-6 shadow-glass"
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold font-display">Draft History</h3>
							<button
								onClick={() => setShowHistory(false)}
								className="text-muted-foreground hover:text-foreground"
								aria-label="Close history"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<div className="space-y-3">
							{history.map((draft) => (
								<Card
									key={draft.id}
									className="p-3 text-sm cursor-pointer hover:shadow-soft"
									onClick={() => {
										toast.success("Draft loaded");
										setShowHistory(false);
									}}
								>
									<div className="font-medium">{draft.threadSubject}</div>
									<div className="text-xs text-muted-foreground mt-1">{draft.createdAt}</div>
									<div className="text-xs text-muted-foreground mt-2 line-clamp-2">{draft.text}</div>
								</Card>
							))}
						</div>
					</motion.aside>
				)}
			</AnimatePresence>

			{/* Main Content */}
			<div className="grid gap-6">
				<AnimatePresence mode="wait">
					{ui === "hero" && (
						<motion.section {...section}>
							<Card className="p-12 text-center">
								<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
									<Mail className="h-8 w-8 text-primary" />
								</div>
								<h1 className="text-3xl md:text-4xl font-semibold font-display">
									Draft Your Next Reply
								</h1>
								<p className="mt-3 text-base text-muted-foreground max-w-md mx-auto">
									{isAuthorized 
										? "Select a Gmail thread to start generating AI-powered replies."
										: "Connect your Gmail account to fetch threads and generate AI-powered replies."
									}
								</p>
								<div className="mt-8 flex gap-3 justify-center">
									{isAuthorized ? (
										<Button size="lg" onClick={() => setUi("threadPicker")}>
											Select a Thread
										</Button>
									) : (
										<Button 
											size="lg" 
											onClick={connectGmail}
											disabled={authLoading}
											className="bg-[#05c290] hover:bg-[#04ab7e]"
										>
											{authLoading ? "Connecting..." : "Connect Gmail"}
										</Button>
									)}
								</div>
							</Card>
						</motion.section>
					)}
				</AnimatePresence>

				<AnimatePresence mode="wait">
					{ui === "threadPicker" && (
						<motion.section {...section}>
							<Card className="p-6">
								<div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
									<h2 className="text-xl font-semibold font-display">Threads</h2>
									<div className="flex gap-2 items-center">
										<Input placeholder="Search threads..." className="md:w-64" />
										<Button
											variant="outline"
											size="sm"
											onClick={refetchThreads}
											disabled={threadsLoading}
										>
											<RefreshCw className={`h-4 w-4 ${threadsLoading ? 'animate-spin' : ''}`} />
										</Button>
									</div>
								</div>
								
								{threadsLoading ? (
									<div className="py-8">
										<LoaderDots label="Loading threads..." />
									</div>
								) : threadsError ? (
									<EmptyState
										icon="⚠️"
										title="Failed to load threads"
										description={threadsError}
									/>
								) : threads.length === 0 ? (
									<EmptyState
										icon="📭"
										title="No threads found"
										description="Your Gmail inbox appears to be empty, or you may need to reconnect your account."
									/>
								) : (
									<ul className="divide-y divide-border">
										{threads.map((t) => (
											<motion.li
												key={t.id}
												whileHover={{ backgroundColor: "var(--accent)" }}
												className="flex cursor-pointer items-center justify-between py-3 rounded-md px-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
												onClick={() => {
													setSelectedThreadId(t.id);
													setUi("compose");
												}}
												tabIndex={0}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														setSelectedThreadId(t.id);
														setUi("compose");
													}
												}}
											>
												<div className="flex-1">
													<div className="text-sm font-medium">{t.subject}</div>
													<div className="text-xs text-muted-foreground mt-0.5">{t.from}</div>
													<div className="text-xs text-muted-foreground mt-1">{t.snippet}</div>
												</div>
												<div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
													{new Date(t.date).toLocaleDateString()}
												</div>
											</motion.li>
										))}
									</ul>
								)}
							</Card>
						</motion.section>
					)}
				</AnimatePresence>

				<AnimatePresence mode="wait">
					{ui === "compose" && (
						<motion.section {...section} className="grid gap-6 lg:grid-cols-2">
							<Card className="p-6">
								<h3 className="text-base font-semibold font-display">Thread Context</h3>
								<div className="mt-3 h-64 overflow-auto rounded-md border border-border p-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" tabIndex={0}>
									<p><strong>Subject:</strong> {threads.find((t) => t.id === selectedThreadId)?.subject}</p>
									<p className="mt-2">
										<strong>Preview:</strong> {threads.find((t) => t.id === selectedThreadId)?.snippet}
									</p>
								</div>
							</Card>
							<Card className="p-6">
								<h3 className="text-base font-semibold font-display">Draft Controls</h3>
								<div className="mt-4 grid gap-4">
									<label className="flex flex-col gap-2 text-sm">
										<span className="font-medium">Tone</span>
										<select
											value={tone}
											onChange={(e) => setTone(e.target.value as "friendly" | "formal" | "brief")}
											className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
										>
											<option value="friendly">Friendly</option>
											<option value="formal">Formal</option>
											<option value="brief">Brief</option>
										</select>
									</label>
									<label className="flex flex-col gap-2 text-sm">
										<span className="font-medium">Length: {length} words</span>
										<Slider
											value={[length]}
											onValueChange={(values: number[]) => setLength(values[0])}
											min={50}
											max={500}
											step={10}
										/>
									</label>
									<label className="flex items-center gap-2 text-sm">
										<input
											type="checkbox"
											checked={bullets}
											onChange={(e) => setBullets(e.target.checked)}
											className="h-4 w-4 accent-primary rounded"
										/>
										<span className="font-medium">Use bullet points</span>
									</label>
									<Button
										className="mt-2 w-full"
										onClick={async () => {
											if (!selectedThreadId) return;
											setUi("result");
											await run({
												input: "",
												meta: { threadId: selectedThreadId, tone, length, bullets },
											});
										}}
										disabled={status === "running"}
									>
										{status === "running" ? <LoaderDots label="Composing polite reply" /> : "Generate Reply"}
									</Button>
								</div>
							</Card>
						</motion.section>
					)}
				</AnimatePresence>

			<AnimatePresence mode="wait">
				{ui === "result" && (
					<motion.section {...section}>
						<Card className="p-6">
							<h3 className="text-base font-semibold font-display">Draft</h3>
							<div className="mt-3" aria-live="polite">
								{status === "running" ? (
									<div className="min-h-[200px] flex items-center justify-center">
										<LoaderDots label="Generating" />
									</div>
								) : result?.text ? (
									<DraftEditor
										initialDraft={result.text}
										onRegenerate={async () => {
											if (!selectedThreadId) return;
											setUi("compose");
											await run({
												input: "",
												meta: { threadId: selectedThreadId, tone, length, bullets },
											});
											setUi("result");
										}}
										isRegenerating={false}
									/>
								) : (
									<div className="min-h-[200px] rounded-md border border-border p-4 flex items-center justify-center text-sm text-muted-foreground">
										Your draft will appear here.
									</div>
								)}
							</div>
							{result?.text && (
								<div className="mt-6 flex flex-wrap gap-3">
									<Button variant="outline" onClick={() => setUi("compose")}>
										<RefreshCw className="h-4 w-4 mr-2" />
										Back to Controls
									</Button>
									<Button variant="secondary" disabled>
										<Send className="h-4 w-4 mr-2" />
										Send via Gmail
									</Button>
								</div>
							)}
						</Card>
					</motion.section>
				)}
			</AnimatePresence>
			</div>
		</div>
	);
}

export default function PlaygroundPage() {
	return (
		<Suspense fallback={<LoaderDots label="Loading playground..." />}>
			<PlaygroundContent />
		</Suspense>
	);
}
