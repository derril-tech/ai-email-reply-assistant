import { useState } from "react";

type RunMeta = {
	threadId: string;
	tone?: "friendly" | "formal" | "brief";
	length?: number;
	bullets?: boolean;
};

type RunArgs = { input: string; meta: RunMeta };

export function useAgent(projectId: string) {
	const [messages, setMessages] = useState<any[]>([]);
	const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<any | null>(null);

	async function run(args: RunArgs) {
		const { input, meta } = args;
		try {
			setStatus("running");
			setError(null);
			setResult(null);
			const r = await fetch("/agent/run", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ projectId, input, meta }),
			});
			if (!r.ok) {
				const d = await r.json().catch(() => ({}));
				throw new Error(d?.detail || "Run failed");
			}
			const { jobId } = await r.json();

			let finalResult: any = null;
			for (let i = 0; i < 40; i++) {
				const jr = await fetch(`/jobs/${jobId}`);
				const data = await jr.json();
				if (data.status === "done") {
					finalResult = data.result;
					break;
				}
				await new Promise((res) => setTimeout(res, 800));
			}

			setResult(finalResult);
			setMessages((m) => [
				...m,
				{ role: "user", content: input, meta },
				{ role: "assistant", content: finalResult?.text ?? "", meta: finalResult?.meta },
			]);
			setStatus("done");
		} catch (e: any) {
			setError(e?.message || "Run failed");
			setStatus("error");
		}
	}

	return { messages, run, status, result, error };
}


