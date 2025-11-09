/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAgent } from "../../hooks/useAgent";
import LoaderDots from "../../components/LoaderDots";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type UIState = "hero" | "threadPicker" | "compose" | "result";

export default function PlaygroundPage() {
	const [ui, setUi] = useState<UIState>("hero");
	const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
	const [tone, setTone] = useState("friendly");
	const [length, setLength] = useState<number>(150);
	const [bullets, setBullets] = useState<boolean>(false);
	const { run, status, result } = useAgent("default");

	const threads = [
		{ id: "t1", subject: "Q3 Planning", snippet: "Let's align on the next steps..." },
		{ id: "t2", subject: "Invoice #3421", snippet: "Please find attached the invoice..." },
	];

	useEffect(() => {
		if (status === "done") toast.success("Reply generated successfully");
		if (status === "error") toast.error("Failed to generate reply");
	}, [status]);

	const section = useMemo(
		() => ({
			initial: { opacity: 0, y: 8 },
			animate: { opacity: 1, y: 0 },
			exit: { opacity: 0, y: -8 },
			transition: { duration: 0.2 },
		}),
		[]
	);

	return (
		<div className="grid gap-6">
			<AnimatePresence mode="wait">
				{ui === "hero" && (
					<motion.section {...section} className="rounded-2xl bg-surface p-10 text-center shadow-glass">
					<h1 className="text-2xl font-semibold text-text">AI Email Reply Playground</h1>
					<p className="mt-2 text-text/70">Connect Gmail to get started.</p>
					<div className="mt-6">
						<button
							className="rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-text shadow-soft transition-all hover:shadow-glass"
							onClick={() => setUi("threadPicker")}
						>
							Connect Gmail
						</button>
					</div>
					</motion.section>
				)}
			</AnimatePresence>

			<AnimatePresence mode="wait">
				{ui === "threadPicker" && (
					<motion.section {...section} className="rounded-2xl bg-surface p-6 shadow-soft">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-text">Threads</h2>
						<input
							placeholder="Search threads..."
							className="rounded-md border border-border bg-background px-3 py-2 text-sm"
						/>
					</div>
					<ul className="divide-y divide-border">
						{threads.map((t) => (
							<li
								key={t.id}
								className="flex cursor-pointer items-center justify-between py-3"
								onClick={() => {
									setSelectedThreadId(t.id);
									setUi("compose");
								}}
							>
								<div>
									<div className="text-sm font-medium text-text">{t.subject}</div>
									<div className="text-xs text-text/60">{t.snippet}</div>
								</div>
								<div className="text-xs text-text/50">today</div>
							</li>
						))}
					</ul>
					</motion.section>
				)}
			</AnimatePresence>

			<AnimatePresence mode="wait">
				{ui === "compose" && (
					<motion.section {...section} className="grid gap-6 md:grid-cols-2">
					<div className="rounded-2xl bg-surface p-6 shadow-soft">
						<h3 className="text-sm font-semibold text-text">Thread Context</h3>
						<div className="mt-3 h-64 overflow-auto rounded-md border border-border p-3 text-sm text-text/80">
							<p>Subject: {(threads.find((t) => t.id === selectedThreadId) || {}).subject}</p>
							<p className="mt-2">
								Preview: {(threads.find((t) => t.id === selectedThreadId) || {}).snippet}
							</p>
						</div>
					</div>
					<div className="rounded-2xl bg-surface p-6 shadow-soft">
						<h3 className="text-sm font-semibold text-text">Draft Controls</h3>
						<div className="mt-4 grid gap-3">
							<label className="text-sm text-text/70">
								Tone
								<select
									value={tone}
									onChange={(e) => setTone(e.target.value)}
									className="ml-2 rounded-md border border-border bg-background px-2 py-1 text-sm"
								>
									<option value="friendly">friendly</option>
									<option value="formal">formal</option>
									<option value="brief">brief</option>
								</select>
							</label>
							<label className="text-sm text-text/70">
								Length ({length})
								<input
									type="range"
									min={50}
									max={500}
									value={length}
									onChange={(e) => setLength(parseInt(e.target.value, 10))}
									className="ml-2 w-full"
								/>
							</label>
							<label className="flex items-center gap-2 text-sm text-text/70">
								<input
									type="checkbox"
									checked={bullets}
									onChange={(e) => setBullets(e.target.checked)}
								/>
								Use bullet points
							</label>
							<button
								className="mt-2 w-full rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-text shadow-soft transition-all hover:shadow-glass"
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
							</button>
						</div>
					</div>
					</motion.section>
				)}
			</AnimatePresence>

			<AnimatePresence mode="wait">
				{ui === "result" && (
					<motion.section {...section} className="rounded-2xl bg-surface p-6 shadow-soft">
					<h3 className="text-sm font-semibold text-text">Draft</h3>
					<div className="mt-3 whitespace-pre-wrap rounded-md border border-border p-3 text-sm text-text/90" aria-live="polite">
						{status === "running" ? <LoaderDots label="Generating" /> : (result?.text || "Your draft will appear here.")}
					</div>
					<div className="mt-4 flex flex-wrap gap-3">
						<button
							className="rounded-md border border-border bg-background px-3 py-2 text-sm"
							onClick={() => setUi("compose")}
						>
							🔁 Regenerate
						</button>
						<button
							className="rounded-md border border-border bg-background px-3 py-2 text-sm"
							onClick={() => {
								navigator.clipboard.writeText(result?.text || "");
								t
								oast.success("Copied to clipboard");
							}}
						>
							📋 Copy
						</button>
						<button className="rounded-md border border-border bg-background px-3 py-2 text-sm">
							✉️ Send via Gmail
						</button>
					</div>
					</motion.section>
				)}
			</AnimatePresence>
		</div>
	);
}


