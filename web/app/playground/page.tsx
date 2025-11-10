"use client";

import { useEffect, useMemo, useState } from "react";
import { useAgent } from "../../hooks/useAgent";
import LoaderDots from "../../components/LoaderDots";
import EmptyState from "../../components/EmptyState";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type UIState = "hero" | "threadPicker" | "compose" | "result";

type DraftHistory = {
	id: string;
	threadSubject: string;
	text: string;
	createdAt: string;
};

export default function PlaygroundPage() {
	const [ui, setUi] = useState<UIState>("hero");
	const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
	const [tone, setTone] = useState<"friendly" | "formal" | "brief">("friendly");
	const [length, setLength] = useState<number>(150);
	const [bullets, setBullets] = useState<boolean>(false);
	const [showHistory, setShowHistory] = useState<boolean>(false);
	const [history, setHistory] = useState<DraftHistory[]>([]);
	const { run, status, result, messages } = useAgent("default");

	const threads = [
		{ id: "t1", subject: "Q3 Planning", snippet: "Let's align on the next steps..." },
		{ id: "t2", subject: "Invoice #3421", snippet: "Please find attached the invoice..." },
	];

	useEffect(() => {
		if (status === "done") {
			toast.success("Reply generated successfully");
			// Add to history
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
	}, [status, result, selectedThreadId, threads]);

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
					className="fixed right-4 top-20 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-glass transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
					aria-label="Toggle history"
				>
					📜
				</button>
			)}

			{/* History Sidebar */}
			<AnimatePresence>
				{(showHistory || window.innerWidth >= 1024) && history.length > 0 && (
					<motion.aside
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className="fixed right-0 top-16 bottom-0 z-40 w-80 overflow-y-auto bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl p-6 shadow-glass lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:z-0"
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-text font-display">Draft History</h3>
							<button
								onClick={() => setShowHistory(false)}
								className="lg:hidden text-text/70 hover:text-text"
								aria-label="Close history"
							>
								✕
							</button>
						</div>
						<div className="space-y-3">
							{history.map((draft) => (
								<div
									key={draft.id}
									className="rounded-lg border border-border bg-background p-3 text-sm transition-all hover:shadow-soft cursor-pointer"
									onClick={() => {
										toast.success("Draft loaded");
										setShowHistory(false);
									}}
								>
									<div className="font-medium text-text">{draft.threadSubject}</div>
									<div className="text-xs text-text/50 mt-1">{draft.createdAt}</div>
									<div className="text-xs text-text/70 mt-2 line-clamp-2">{draft.text}</div>
								</div>
							))}
						</div>
					</motion.aside>
				)}
			</AnimatePresence>

			{/* Main Content */}
			<div className="grid gap-6">
			<AnimatePresence mode="wait">
				{ui === "hero" && (
					<motion.section {...section} className="rounded-2xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl p-12 text-center shadow-glass">
					<h1 className="text-3xl md:text-4xl font-semibold text-text font-display">AI Email Reply Playground</h1>
					<p className="mt-3 text-base text-text/70">Connect Gmail to get started.</p>
					<div className="mt-8">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.98 }}
							className="rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-medium text-white shadow-soft transition-all hover:shadow-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
							onClick={() => setUi("threadPicker")}
						>
							Connect Gmail
						</motion.button>
					</div>
					</motion.section>
				)}
			</AnimatePresence>

			<AnimatePresence mode="wait">
				{ui === "threadPicker" && (
					<motion.section {...section} className="rounded-2xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl p-6 shadow-soft">
					<div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<h2 className="text-xl font-semibold text-text font-display">Threads</h2>
						<input
							placeholder="Search threads..."
							className="rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						/>
					</div>
					{threads.length === 0 ? (
						<EmptyState
							icon="📭"
							title="No threads found"
							description="Connect your Gmail account to see your email threads here."
						/>
					) : (
						<ul className="divide-y divide-border">
							{threads.map((t) => (
								<motion.li
									key={t.id}
									whileHover={{ backgroundColor: "rgba(91, 134, 229, 0.05)" }}
									className="flex cursor-pointer items-center justify-between py-3 rounded-md px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
									<div>
										<div className="text-sm font-medium text-text">{t.subject}</div>
										<div className="text-xs text-text/60">{t.snippet}</div>
									</div>
									<div className="text-xs text-text/50">today</div>
								</motion.li>
							))}
						</ul>
					)}
					</motion.section>
				)}
			</AnimatePresence>

			<AnimatePresence mode="wait">
				{ui === "compose" && (
					<motion.section {...section} className="grid gap-6 lg:grid-cols-2">
					<div className="rounded-2xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl p-6 shadow-soft">
						<h3 className="text-base font-semibold text-text font-display">Thread Context</h3>
						<div className="mt-3 h-64 overflow-auto rounded-md border border-border p-3 text-sm text-text/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" tabIndex={0}>
							<p><strong>Subject:</strong> {(threads.find((t) => t.id === selectedThreadId) || {}).subject}</p>
							<p className="mt-2">
								<strong>Preview:</strong> {(threads.find((t) => t.id === selectedThreadId) || {}).snippet}
							</p>
						</div>
					</div>
					<div className="rounded-2xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl p-6 shadow-soft">
						<h3 className="text-base font-semibold text-text font-display">Draft Controls</h3>
						<div className="mt-4 grid gap-4">
							<label className="flex flex-col gap-2 text-sm text-text/70">
								<span className="font-medium">Tone</span>
								<select
									value={tone}
									onChange={(e) => setTone(e.target.value as "friendly" | "formal" | "brief")}
									className="rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
								>
									<option value="friendly">Friendly</option>
									<option value="formal">Formal</option>
									<option value="brief">Brief</option>
								</select>
							</label>
							<label className="flex flex-col gap-2 text-sm text-text/70">
								<span className="font-medium">Length: {length} words</span>
								<input
									type="range"
									min={50}
									max={500}
									value={length}
									onChange={(e) => setLength(parseInt(e.target.value, 10))}
									className="w-full accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
								/>
							</label>
							<label className="flex items-center gap-2 text-sm text-text/70">
								<input
									type="checkbox"
									checked={bullets}
									onChange={(e) => setBullets(e.target.checked)}
									className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
								/>
								<span className="font-medium">Use bullet points</span>
							</label>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="mt-2 w-full rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-medium text-white shadow-soft transition-all hover:shadow-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
							</motion.button>
						</div>
					</div>
					</motion.section>
				)}
			</AnimatePresence>

			<AnimatePresence mode="wait">
				{ui === "result" && (
					<motion.section {...section} className="rounded-2xl bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl p-6 shadow-soft">
					<h3 className="text-base font-semibold text-text font-display">Draft</h3>
					<div className="mt-3 whitespace-pre-wrap rounded-md border border-border p-4 text-sm text-text/90 min-h-[200px]" aria-live="polite">
						{status === "running" ? <LoaderDots label="Generating" /> : (result?.text || "Your draft will appear here.")}
					</div>
					<div className="mt-6 flex flex-wrap gap-3">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="rounded-lg border-2 border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
							onClick={() => setUi("compose")}
						>
							🔁 Regenerate
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="rounded-lg border-2 border-secondary bg-transparent px-4 py-2 text-sm font-medium text-secondary transition-all hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
							onClick={() => {
								navigator.clipboard.writeText(result?.text || "");
								toast.success("Copied to clipboard");
							}}
						>
							📋 Copy
						</motion.button>
						<motion.button 
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:shadow-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
						>
							✉️ Send via Gmail
						</motion.button>
					</div>
					</motion.section>
				)}
			</AnimatePresence>
			</div>
		</div>
	);
}


